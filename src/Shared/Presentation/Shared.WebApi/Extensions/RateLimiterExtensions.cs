using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Shared.WebApi.Extensions;

public static class RateLimiterExtensions
{
    public static IServiceCollection AddApiRateLimiter(this IServiceCollection services, IConfiguration config)
    {
        services.AddRateLimiter(options =>
        {
            options.AddFixedWindowLimiter("api", opt =>
            {
                opt.PermitLimit = 100;
                opt.Window = TimeSpan.FromSeconds(1);
                opt.QueueLimit = 5;
            });
        });

        return services;
    }
}
