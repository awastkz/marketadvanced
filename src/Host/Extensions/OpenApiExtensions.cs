using System.Reflection;
using Microsoft.AspNetCore.Mvc;

namespace MarketAdvanced.Host.Extensions;

/// <summary>
/// OpenAPI по сервисам: /openapi/catalog.json — всё API сервиса (для его команды),
/// /openapi/catalog-internal.json — только контроллеры с [ApiExplorerSettings(GroupName = "catalog-internal")], для других сервисов.
/// Документ -internal создаётся, только если в сервисе есть такие контроллеры.
/// </summary>
public static class OpenApiExtensions
{
    private const string InternalSuffix = "-internal";

    public static string[] ServiceOpenApiDocuments(IConfiguration config) =>
        ServicesExtensions.EnabledServices(config)
            .SelectMany(service =>
            {
                var doc = service.ToLowerInvariant();
                return HasInternalApi(service, doc + InternalSuffix) ? new[] { doc, doc + InternalSuffix } : new[] { doc };
            })
            .ToArray();

    public static IServiceCollection AddServiceOpenApi(this IServiceCollection services, IConfiguration config)
    {
        foreach (var doc in ServiceOpenApiDocuments(config))
        {
            // документ сервиса включает и его внутренние контроллеры
            services.AddOpenApi(doc, o => o.ShouldInclude = d =>
                d.GroupName == doc || (!doc.EndsWith(InternalSuffix) && d.GroupName == doc + InternalSuffix));
        }

        return services;
    }

    private static bool HasInternalApi(string service, string internalGroup) =>
        Assembly.Load($"{service}.WebApi").GetTypes()
            .Any(t => t.GetCustomAttribute<ApiExplorerSettingsAttribute>()?.GroupName == internalGroup);
}
