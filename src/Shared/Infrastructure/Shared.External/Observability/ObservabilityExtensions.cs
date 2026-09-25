using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace MarketAdvanced.Shared.External.Observability;

/// <summary>OpenTelemetry: трассы, метрики, логи. Принимает builder, потому что трогает и Services, и Logging.</summary>
public static class ObservabilityExtensions
{
    public static IHostApplicationBuilder AddObservability(this IHostApplicationBuilder builder)
    {
        // Трассы, метрики и логи уходят по OTLP в otel-collector (OTEL_EXPORTER_OTLP_ENDPOINT), дальше Prometheus/Loki/Grafana.
        // Service:Name отличает api от catalog в одной трассе. Без endpoint экспортер молча ничего не шлёт.
        var serviceName = builder.Configuration["Service:Name"] ?? "api";

        builder.Services.AddOpenTelemetry()
            .ConfigureResource(r => r.AddService(serviceName))
            .WithTracing(t => t
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddNpgsql()
                .AddOtlpExporter())
            .WithMetrics(m => m
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation()   // GC, куча, очередь пула потоков, working set: dotnet_* в Prometheus
                .AddOtlpExporter());

        builder.Logging.AddOpenTelemetry(o =>
        {
            o.IncludeFormattedMessage = true;
            o.IncludeScopes = true;
            o.AddOtlpExporter();
        });

        return builder;
    }
}
