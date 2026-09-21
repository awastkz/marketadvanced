using Amazon.S3;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MarketAdvanced.Shared.Options;
using MarketAdvanced.Identity.Infrastructure;
using MarketAdvanced.Identity.Application.Contracts;
using MarketAdvanced.Identity.Infrastructure.Repositories;

namespace MarketAdvanced.Identity;

public static class IdentityServiceAPI
{
    public static IServiceCollection AddIdentityServiceAPI(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(IdentityServiceAPI).Assembly));
        services.AddScoped<IAvatarStorage, S3AvatarStorage>();

services.Configure<JwtOptions>(config.GetSection("Jwt"));
        services.AddDbContext<IdentityDbContext>(opt => opt.UseNpgsql(config.GetConnectionString("Postgres")));
        services.AddScoped<IUserRepository, UserRepository>();
services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
services.AddScoped<ITokenService, TokenService>();
services.AddValidatorsFromAssembly(typeof(IdentityServiceAPI).Assembly);
          // чтобы контроллеры модуля точно подхватились
          services.AddControllers()
              .AddApplicationPart(typeof(IdentityServiceAPI).Assembly);

          return services;
    }
}