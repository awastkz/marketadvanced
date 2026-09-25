using MarketAdvanced.Shared.Application.Behaviors;
using Amazon.S3;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MarketAdvanced.Shared.External.Options;
using MarketAdvanced.Identity.Persistence;
using MarketAdvanced.Identity.Application.Contracts;
using MarketAdvanced.Identity.Persistence.Repositories;

namespace MarketAdvanced.Identity.WebApi;

public static class IdentityServiceAPI
{
    public static IServiceCollection AddIdentityServiceAPI(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Application.AssemblyReference.Assembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });
        services.AddScoped<IAvatarStorage, S3AvatarStorage>();

services.Configure<JwtOptions>(config.GetSection("Jwt"));
        services.AddDbContext<IdentityDbContext>(opt => opt.UseNpgsql(config.GetConnectionString("Postgres")));
        services.AddScoped<IUserRepository, UserRepository>();
services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
services.AddScoped<ITokenService, TokenService>();
services.AddValidatorsFromAssembly(Application.AssemblyReference.Assembly);
          // чтобы контроллеры модуля точно подхватились
          services.AddControllers()
              .AddApplicationPart(typeof(IdentityServiceAPI).Assembly);

          return services;
    }
}