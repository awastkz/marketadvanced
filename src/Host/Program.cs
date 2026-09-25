using MarketAdvanced.Host.Extensions;
using MarketAdvanced.Shared.External.HealthChecks;
using MarketAdvanced.Shared.External.Observability;
using MarketAdvanced.Shared.WebApi.Extensions;
using Scalar.AspNetCore;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSharedWebApi(builder.Configuration);   // CORS, rate limiter, JWT, ApiExceptionFilter, CurrentUser
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddS3Storage(builder.Configuration);
builder.Services.AddServices(builder.Configuration);       // Identity, Catalog, Cart... по секции Modules

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddPlatformHealthChecks(builder.Configuration);
builder.AddObservability();

var app = builder.Build();

app.UseSharedWebApi();

if (ServicesExtensions.EnabledServices(builder.Configuration).Contains("Identity"))
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

app.MapControllers();
app.MapPlatformHealthChecks();

app.Run();

public partial class Program
{}
