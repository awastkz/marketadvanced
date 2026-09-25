using System.Reflection;
using MarketAdvanced.Shared.Application.Messaging;
using MarketAdvanced.Shared.External.Options;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Shared.External.Messaging;

/// <summary>
/// MassTransit поверх RabbitMQ (секции RabbitMQ и MassTransit).
/// Консьюмеры из consumerAssemblies регистрируются только при MassTransit:Consumers = true (worker).
/// </summary>
public static class MessagingExtensions
{
    public static IServiceCollection AddMessaging(this IServiceCollection services, IConfiguration config, params Assembly[] consumerAssemblies)
    {
        var rabbit = config.GetSection("RabbitMQ").Get<RabbitMqSettings>() ?? new();
        var settings = config.GetSection("MassTransit").Get<MassTransitSettings>() ?? new();

        services.AddMassTransit(x =>
        {
            // очереди в kebab-case: variant-deactivated, а не VariantDeactivated
            x.SetKebabCaseEndpointNameFormatter();

            // api и catalog только публикуют, очереди читает worker.
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
