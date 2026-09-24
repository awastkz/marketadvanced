using MarketAdvanced.Identity;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;
using MarketAdvanced.Catalog;
using MarketAdvanced.Cart;
using MarketAdvanced.Order;
using MarketAdvanced.Payment;
using MarketAdvanced.Shared.Api;
using Scalar.AspNetCore;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using RabbitMQ.Client;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Npgsql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

var builder = WebApplication.CreateBuilder(args);


//rate limiter
builder.Services.AddRateLimiter(options =>
{
 options.AddFixedWindowLimiter("api", opt =>
 {
     opt.PermitLimit = 100;
     opt.Window = TimeSpan.FromSeconds(1);
     opt.QueueLimit = 5;
 });   
});

//cors

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

//jwt

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

builder.Services.AddAuthorization();
builder.Services.AddFluentValidationAutoValidation();
// NotFoundException -> 404, ConflictException -> 409, тело { message }; общий для всех модулей
builder.Services.Configure<MvcOptions>(o => o.Filters.Add<ApiExceptionFilter>());
builder.Services.AddS3Storage(builder.Configuration);
builder.Services.AddCurrentUser();

// Какие модули поднимать в этом процессе: Modules__0=Cart, Modules__1=Catalog ... Пусто = все.
// Так один образ поднимается в compose как несколько сервисов с разными наборами модулей.
var modules = builder.Configuration.GetSection("Modules").Get<string[]>() is { Length: > 0 } list
    ? list.ToHashSet(StringComparer.OrdinalIgnoreCase)
    : new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Identity", "Catalog", "Cart", "Order", "Payment" };

if (modules.Contains("Identity")) builder.Services.AddIdentityServiceAPI(builder.Configuration);
if (modules.Contains("Catalog"))  builder.Services.AddCatalogServiceAPI(builder.Configuration);
if (modules.Contains("Cart"))     builder.Services.AddCartServiceAPI(builder.Configuration);
if (modules.Contains("Order"))    builder.Services.AddOrderServiceAPI(builder.Configuration);
if (modules.Contains("Payment"))  builder.Services.AddPaymentServiceAPI(builder.Configuration);

// ASP.NET сам подхватывает контроллеры из всех сборок, на которые ссылается api.csproj.
// Выключенный модуль не должен отвечать по своим маршрутам, поэтому его сборку убираем из application parts.
var allModules = new[] { "Identity", "Catalog", "Cart", "Order", "Payment" };
builder.Services.AddControllers().ConfigureApplicationPartManager(pm =>
{
    foreach (var part in pm.ApplicationParts.OfType<AssemblyPart>().ToList())
    {
        var name = part.Assembly.GetName().Name!;
        if (allModules.Contains(name) && !modules.Contains(name))
            pm.ApplicationParts.Remove(part);
    }
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// ---- Health checks ----
// /health/live  — процесс жив, без внешних проверок: для restart-политики контейнера.
// /health/ready — Postgres, Redis, RabbitMQ: можно ли принимать трафик. JSON с деталями по каждой.
builder.Services.AddSingleton<RabbitMqConnectionProvider>();
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Postgres")!, name: "postgres", tags: ["ready"], timeout: TimeSpan.FromSeconds(5))
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!, name: "redis", tags: ["ready"], timeout: TimeSpan.FromSeconds(5))
    .AddRabbitMQ(sp => sp.GetRequiredService<RabbitMqConnectionProvider>().GetAsync(), name: "rabbitmq", tags: ["ready"], timeout: TimeSpan.FromSeconds(5));

// OpenTelemetry: трассы, метрики и логи уходят по OTLP в otel-collector (OTEL_EXPORTER_OTLP_ENDPOINT), дальше Prometheus/Loki/Grafana.
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

var app = builder.Build();

app.UseRateLimiter();
if (modules.Contains("Identity"))
{
    app.MapGet("api/login", () => "ok").RequireRateLimiting("api");
    app.MapGet("api/refresh", () => "ok").RequireRateLimiting("api");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // документация на /scalar, читает /openapi/v1.json
}

app.UseCors("Frontend");
app.UseHttpsRedirection();

app.UseAuthentication(); // читает токен из заголовка, порядок важен
app.UseAuthorization();

app.MapControllers();

app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = r => r.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
});

app.Run();

public partial class Program
{}

/// <summary>
/// Одно соединение с RabbitMQ на процесс для health check. Если брокер был недоступен,
/// следующая проверка откроет соединение заново, а не вернёт закешированную ошибку.
/// </summary>
sealed class RabbitMqConnectionProvider(IConfiguration config)
{
    private Task<IConnection>? _connection;

    public Task<IConnection> GetAsync()
    {
        var current = _connection;
        if (current is { IsCompleted: false } || current is { IsCompletedSuccessfully: true, Result.IsOpen: true })
            return current;

        var s = config.GetSection("RabbitMQ");
        var factory = new ConnectionFactory
        {
            HostName = s["Host"] ?? "localhost",
            Port = int.TryParse(s["Port"], out var port) ? port : 5672,
            UserName = s["User"] ?? "guest",
            Password = s["Password"] ?? "guest",
            VirtualHost = s["VirtualHost"] ?? "/",
        };
        return _connection = factory.CreateConnectionAsync();
    }
}
