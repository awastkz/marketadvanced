using MarketAdvanced.Shared.Application.Behaviors;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MarketAdvanced.Order.Persistence;

namespace MarketAdvanced.Order.WebApi;

public static class OrderServiceAPI
{
    public static IServiceCollection AddOrderServiceAPI(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Application.AssemblyReference.Assembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddDbContext<OrderDbContext>(
            opt => opt.UseNpgsql(config.GetConnectionString("Postgres"),
            npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "order")
            ));

        services.AddValidatorsFromAssembly(Application.AssemblyReference.Assembly);

        // чтобы контроллеры модуля точно подхватились
        services.AddControllers().AddApplicationPart(typeof(OrderServiceAPI).Assembly);

        return services;
    }
}
