using System.Reflection;
using Microsoft.AspNetCore.Mvc;

namespace MarketAdvanced.Host.Extensions;

/// <summary>
/// OpenAPI по модулям: /openapi/catalog.json — всё API модуля (для его команды),
/// /openapi/catalog-internal.json — только контроллеры с [ApiExplorerSettings(GroupName = "catalog-internal")], для других сервисов.
/// Документ -internal создаётся, только если в модуле есть такие контроллеры.
/// </summary>
public static class OpenApiExtensions
{
    private const string InternalSuffix = "-internal";

    public static string[] ModuleOpenApiDocuments(IConfiguration config) =>
        ServicesExtensions.EnabledServices(config)
            .SelectMany(module =>
            {
                var doc = module.ToLowerInvariant();
                return HasInternalApi(module, doc + InternalSuffix) ? new[] { doc, doc + InternalSuffix } : new[] { doc };
            })
            .ToArray();

    public static IServiceCollection AddModuleOpenApi(this IServiceCollection services, IConfiguration config)
    {
        foreach (var doc in ModuleOpenApiDocuments(config))
        {
            // модульный документ включает и внутренние контроллеры модуля
            services.AddOpenApi(doc, o => o.ShouldInclude = d =>
                d.GroupName == doc || (!doc.EndsWith(InternalSuffix) && d.GroupName == doc + InternalSuffix));
        }

        return services;
    }

    private static bool HasInternalApi(string module, string internalGroup) =>
        Assembly.Load($"{module}.WebApi").GetTypes()
            .Any(t => t.GetCustomAttribute<ApiExplorerSettingsAttribute>()?.GroupName == internalGroup);
}
