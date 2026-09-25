using MarketAdvanced.Cart.WebApi;
using MarketAdvanced.Catalog.WebApi;
using MarketAdvanced.Identity.WebApi;
using MarketAdvanced.Order.WebApi;
using MarketAdvanced.Payment.WebApi;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

namespace MarketAdvanced.Host.Extensions;

/// <summary>Какие сервисы поднимать в этом процессе (секция Modules) и фильтр их ApplicationParts.</summary>
public static class ServicesExtensions
{
    private static readonly string[] AllServices = { "Identity", "Catalog", "Cart", "Order", "Payment" };

    /// <summary>
    /// Какие модули поднимать в этом процессе: Modules__0=Cart, Modules__1=Catalog ... Пусто = все.
    /// Так один образ поднимается в compose как несколько сервисов с разными наборами модулей.
    /// </summary>
    public static HashSet<string> EnabledServices(IConfiguration config) =>
        config.GetSection("Modules").Get<string[]>() is { Length: > 0 } list
            ? list.ToHashSet(StringComparer.OrdinalIgnoreCase)
            : new HashSet<string>(AllServices, StringComparer.OrdinalIgnoreCase);

    public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration config)
    {
        var modules = EnabledServices(config);

        if (modules.Contains("Identity")) services.AddIdentityServiceAPI(config);
        if (modules.Contains("Catalog"))  services.AddCatalogServiceAPI(config);
        if (modules.Contains("Cart"))     services.AddCartServiceAPI(config);
        if (modules.Contains("Order"))    services.AddOrderServiceAPI(config);
        if (modules.Contains("Payment"))  services.AddPaymentServiceAPI(config);

        // ASP.NET сам подхватывает контроллеры из всех сборок, на которые ссылается Host.csproj.
        // Выключенный модуль не должен отвечать по своим маршрутам, поэтому его сборку <Service>.WebApi убираем из application parts.
        services.AddControllers().ConfigureApplicationPartManager(pm =>
        {
            foreach (var part in pm.ApplicationParts.OfType<AssemblyPart>().ToList())
            {
                var name = part.Assembly.GetName().Name!;
                var service = name.EndsWith(".WebApi") ? name[..^".WebApi".Length] : null;
                if (service is not null && AllServices.Contains(service) && !modules.Contains(service))
                    pm.ApplicationParts.Remove(part);
            }
        });

        return services;
    }
}
