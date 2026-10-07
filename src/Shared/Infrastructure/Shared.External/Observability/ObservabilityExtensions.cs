using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;

namespace MarketAdvanced.Shared.External.Observability;

/// <summary>OpenTelemetry: трассы, метрики, логи; сами логи пишет Serilog. Принимает builder, потому что трогает и Services, и Logging.</summary>
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
                // трассы временно выключены на время нагрузочных тестов: спаны на каждый запрос искажают замеры.
                // Вернуть: убрать строку ниже
                .SetSampler(new AlwaysOffSampler())
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddNpgsql()
                .AddSource("MassTransit")   // publish/consume: трасса идёт от HTTP-запроса через RabbitMQ до консьюмера
                .AddOtlpExporter())
            .WithMetrics(m => m
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation()   // GC, куча, очередь пула потоков, working set: dotnet_* в Prometheus
                .AddMeter("MassTransit")       // сколько сообщений опубликовано, обработано и упало, по типу сообщения
                .AddOtlpExporter());

        // Логи пишет Serilog: уровни и формат в секции Serilog (appsettings), вывод в консоль.
        // Встроенные провайдеры убираем, иначе каждая строка печаталась бы в консоль дважды.
        // writeToProviders: Serilog передаёт события дальше в провайдер OpenTelemetry ниже, поэтому логи по-прежнему доходят до Loki.
        builder.Logging.ClearProviders();
        builder.Services.AddSerilog((services, logger) => logger
            .ReadFrom.Configuration(builder.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Service", serviceName)
            .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}"),
            writeToProviders: true);

        builder.Logging.AddOpenTelemetry(o =>
        {
            o.IncludeFormattedMessage = true;
            o.IncludeScopes = true;
            o.AddOtlpExporter();
        });

        return builder;
    }
}
