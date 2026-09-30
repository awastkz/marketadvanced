using System.Reflection;
using MarketAdvanced.Shared.Application.Messaging;
using MarketAdvanced.Shared.External.Options;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Shared.External.Messaging;

/// <summary>
/// MassTransit поверх RabbitMQ (секции RabbitMQ и MassTransit).
/// Консьюмеры из consumerAssemblies регистрируются только при MassTransit:Consumers = true.
/// </summary>
public static class MessagingExtensions
{
    public static IServiceCollection AddMessaging(this IServiceCollection services, IConfiguration config,
        Action<IBusRegistrationConfigurator>? configureOutbox, params Assembly[] consumerAssemblies)
    {
        var rabbit = config.GetSection("RabbitMQ").Get<RabbitMqSettings>() ?? new();
        var settings = config.GetSection("MassTransit").Get<MassTransitSettings>() ?? new();

        services.AddMassTransit(x =>
        {
            // очереди в kebab-case с префиксом сервиса: order.variant-created
            x.SetEndpointNameFormatter(new ServiceEndpointNameFormatter());

            // outbox сервиса, если он включён в этом процессе (см. ServicesExtensions.ConfigureOutbox в Host)
            configureOutbox?.Invoke(x);

            // Проверка на пустой список обязательна: AddConsumers() без сборок сканирует все загруженные,
            // включая внутренние консьюмеры MassTransit (JobService), и приложение падает на старте.
            if (settings.Consumers && consumerAssemblies.Length > 0)
                x.AddConsumers(consumerAssemblies);

            x.UsingRabbitMq((ctx, cfg) =>
            {
                cfg.Host(rabbit.Host, rabbit.Port, rabbit.VirtualHost, h =>
                {
                    h.Username(rabbit.User);
                    h.Password(rabbit.Password);
                });
                cfg.UseRawJsonSerializer(isDefault: true);
                cfg.UseRawJsonDeserializer(isDefault: true);
                cfg.PrefetchCount = settings.PrefetchCount;
                // после всех попыток сообщение уходит в очередь <endpoint>_error
                cfg.UseMessageRetry(r => r.Intervals(100, 500, 1000, 5000));
                cfg.ConfigureEndpoints(ctx);
            });
        });

        services.AddScoped<IEventPublisher, MassTransitEventPublisher>();

        return services;
    }
}
