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
using Microsoft.AspNetCore.Mvc;

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

builder.Services.AddIdentityServiceAPI(builder.Configuration);
builder.Services.AddCatalogServiceAPI(builder.Configuration);
builder.Services.AddCartServiceAPI(builder.Configuration);
builder.Services.AddOrderServiceAPI(builder.Configuration);
builder.Services.AddPaymentServiceAPI(builder.Configuration);

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseRateLimiter();
app.MapGet("api/login", () => "ok").RequireRateLimiting("api");
app.MapGet("api/refresh", () => "ok").RequireRateLimiting("api");

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

app.Run();

public partial class Program
{}
