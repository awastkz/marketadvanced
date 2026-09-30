using System.Reflection;
using MarketAdvanced.Cart.WebApi;
using MarketAdvanced.Catalog.Persistence.Messaging;
using MarketAdvanced.Catalog.WebApi;
using MarketAdvanced.Identity.WebApi;
using MarketAdvanced.Order.WebApi;
using MarketAdvanced.Payment.WebApi;
using MassTransit;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

namespace MarketAdvanced.Host.Extensions;

/// <summary>Какие сервисы поднимать в этом процессе (секция Services) и фильтр их ApplicationParts.</summary>
public static class ServicesExtensions
{
    private static readonly string[] AllServices = { "Identity", "Catalog", "Cart", "Order", "Payment" };

    /// <summary>
    /// Какие сервисы поднимать в этом процессе: Services__0=Cart, Services__1=Catalog ... Пусто = все.
    /// Так один образ поднимается в compose как несколько контейнеров с разными наборами сервисов.
    /// </summary>
    public static HashSet<string> EnabledServices(IConfiguration config) =>
        config.GetSection("Services").Get<string[]>() is { Length: > 0 } list
            ? list.ToHashSet(StringComparer.OrdinalIgnoreCase)
            : new HashSet<string>(AllServices, StringComparer.OrdinalIgnoreCase);

    /// <summary>Сборки &lt;Service&gt;.External поднятых сервисов: в них лежат консьюмеры MassTransit.</summary>
    public static Assembly[] ConsumerAssemblies(IConfiguration config)
    {
        var enabled = EnabledServices(config);
        return AllServices
            .Where(enabled.Contains)
            .Select(s => Assembly.Load($"{s}.External"))
            .ToArray();
    }

    /// <summary>
    /// Outbox поднятого сервиса. Bus outbox MassTransit поддерживает один DbContext на шину,
    /// поэтому включается только когда в процессе один сервис (прод). В dev все сервисы в одном app, outbox выключен.
    /// </summary>
    public static Action<IBusRegistrationConfigurator>? ConfigureOutbox(IConfiguration config)
    {
        var enabled = EnabledServices(config);
        if (enabled.Count != 1)
            return null;

        return enabled.Single() switch
        {
            "Catalog" => x => x.AddCatalogOutbox(),
            _ => null,
        };
    }

    public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration config)
    {
        var enabled = EnabledServices(config);

        if (enabled.Contains("Identity")) services.AddIdentityServiceAPI(config);
        if (enabled.Contains("Catalog"))  services.AddCatalogServiceAPI(config);
        if (enabled.Contains("Cart"))     services.AddCartServiceAPI(config);
        if (enabled.Contains("Order"))    services.AddOrderServiceAPI(config);
        if (enabled.Contains("Payment"))  services.AddPaymentServiceAPI(config);

        // ASP.NET сам подхватывает контроллеры из всех сборок, на которые ссылается Host.csproj.
        // Выключенный сервис не должен отвечать по своим маршрутам, поэтому его сборку <Service>.WebApi убираем из application parts.
        services.AddControllers(o => o.Conventions.Add(new ServiceGroupNameConvention())).ConfigureApplicationPartManager(pm =>
        {
            foreach (var part in pm.ApplicationParts.OfType<AssemblyPart>().ToList())
            {
                var name = part.Assembly.GetName().Name!;
                var service = name.EndsWith(".WebApi") ? name[..^".WebApi".Length] : null;
                if (service is not null && AllServices.Contains(service) && !enabled.Contains(service))
                    pm.ApplicationParts.Remove(part);
            }
        });

        return services;
    }
}
