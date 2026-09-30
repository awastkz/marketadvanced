using System.Reflection;
using MarketAdvanced.Host.Extensions;
using MarketAdvanced.Shared.External.HealthChecks;
using MarketAdvanced.Shared.External.Messaging;
using MarketAdvanced.Shared.External.Observability;
using MarketAdvanced.Shared.WebApi.Extensions;
using Scalar.AspNetCore;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Генерация openapi/*.json при сборке (GetDocument.Insider) запускает Program без окружения.
// Заглушки только для обязательных настроек (health checks, ValidateOnStart), соединений при генерации нет.
var isOpenApiGeneration = Assembly.GetEntryAssembly()?.GetName().Name == "GetDocument.Insider";
if (isOpenApiGeneration)
{
    builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
    {
        ["ConnectionStrings:Postgres"] = "Host=localhost",
        ["ConnectionStrings:Redis"] = "localhost",
        ["Catalog:BaseUrl"] = "http://localhost",
    });
}

builder.Services.AddSharedWebApi(builder.Configuration);   // CORS, rate limiter, JWT, ApiExceptionFilter, CurrentUser
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddS3Storage(builder.Configuration);
builder.Services.AddServices(builder.Configuration);       // Identity, Catalog, Cart... по секции Services

// MassTransit + RabbitMQ. При генерации OpenAPI шину не поднимаем: она подключалась бы к брокеру во время сборки.
if (!isOpenApiGeneration)
    builder.Services.AddMessaging(builder.Configuration,
        ServicesExtensions.ConfigureOutbox(builder.Configuration),
        ServicesExtensions.ConsumerAssemblies(builder.Configuration));

// OpenAPI: документ на каждый поднятый сервис (/openapi/catalog.json ...) и внутренний для других сервисов (/openapi/catalog-internal.json), если есть.
// Контроллеры попадают в документ по GroupName из ServiceGroupNameConvention.
builder.Services.AddServiceOpenApi(builder.Configuration);

builder.Services.AddPlatformHealthChecks(builder.Configuration);
builder.AddObservability();

var app = builder.Build();

app.UseSharedWebApi();

if (ServicesExtensions.EnabledServices(builder.Configuration).Contains("Identity"))
{
    app.UseMiddleware<UserSyncMiddleware>(); // после UseAuthentication: ctx.User уже заполнен
    app.MapGet("api/login", () => "ok").RequireRateLimiting("api").WithGroupName("identity");
    app.MapGet("api/refresh", () => "ok").RequireRateLimiting("api").WithGroupName("identity");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(o => o.AddDocuments(OpenApiExtensions.ServiceOpenApiDocuments(builder.Configuration))); // документация на /scalar, переключатель по документам сервисов
}

app.MapControllers();
app.MapPlatformHealthChecks();

app.Run();

public partial class Program
{}
