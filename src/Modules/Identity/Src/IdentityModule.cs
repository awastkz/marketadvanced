using FluentValidation;
using MarketAdvanced.Api.Contracts.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public static class IdentityModule
{
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.AddDbContext<IdentityDbContext>(opt => opt.UseNpgsql(config.GetConnectionString("Postgres")));
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserReader, UserReader>();
services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
services.AddScoped<AuthService>();
services.AddScoped<UserService>();
services.AddScoped<RefreshTokenService>();
services.AddValidatorsFromAssembly(typeof(IdentityModule).Assembly);
          // чтобы контроллеры модуля точно подхватились
          services.AddControllers()
              .AddApplicationPart(typeof(IdentityModule).Assembly);

          return services;
    }
}