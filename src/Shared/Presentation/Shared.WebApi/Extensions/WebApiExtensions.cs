using MarketAdvanced.Shared.WebApi.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Shared.WebApi.Extensions;

/// <summary>Общая веб-настройка любого хоста: CORS, rate limiter, JWT, ApiExceptionFilter, CurrentUser.</summary>
public static class WebApiExtensions
{
    public static IServiceCollection AddSharedWebApi(this IServiceCollection services, IConfiguration config)
    {
        services.AddApiRateLimiter(config);
        services.AddFrontendCors(config);
        services.AddJwtAuthentication(config);

        // Validation -> 400, NotFoundException -> 404, ConflictException -> 409, тело { message }; общий для всех модулей
        services.Configure<MvcOptions>(o => o.Filters.Add<ApiExceptionFilter>());
        services.AddCurrentUser();

        return services;
    }

    /// <summary>Порядок важен: CORS до аутентификации, аутентификация до авторизации.</summary>
    public static WebApplication UseSharedWebApi(this WebApplication app)
    {
        app.UseRateLimiter();
        app.UseCors("Frontend");
        app.UseHttpsRedirection();

        app.UseAuthentication(); // читает токен из заголовка, порядок важен
        app.UseAuthorization();

        return app;
    }
}
