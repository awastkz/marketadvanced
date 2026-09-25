using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Shared.External.HealthChecks;

/// <summary>
/// /health/live  — процесс жив, без внешних проверок: для restart-политики контейнера.
/// /health/ready — Postgres, Redis, RabbitMQ: можно ли принимать трафик. JSON с деталями по каждой.
/// RabbitMQ проверяет MassTransit сам (masstransit-bus, тег ready), регистрируется в AddMessaging.
/// </summary>
public static class HealthCheckExtensions
{
    public static IServiceCollection AddPlatformHealthChecks(this IServiceCollection services, IConfiguration config)
    {
        services.AddHealthChecks()
            .AddNpgSql(config.GetConnectionString("Postgres")!, name: "postgres", tags: ["ready"], timeout: TimeSpan.FromSeconds(5))
            .AddRedis(config.GetConnectionString("Redis")!, name: "redis", tags: ["ready"], timeout: TimeSpan.FromSeconds(5));

        return services;
    }

    public static IEndpointRouteBuilder MapPlatformHealthChecks(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
        endpoints.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = r => r.Tags.Contains("ready"),
            ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
        });

        return endpoints;
    }
}
