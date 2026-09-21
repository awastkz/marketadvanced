using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MarketAdvanced.Order.Infrastructure;

namespace MarketAdvanced.Order;

public static class OrderServiceAPI
{
    public static IServiceCollection AddOrderServiceAPI(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(OrderServiceAPI).Assembly));

        services.AddDbContext<OrderDbContext>(
            opt => opt.UseNpgsql(config.GetConnectionString("Postgres"),
            npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "order")
            ));

        services.AddValidatorsFromAssembly(typeof(OrderServiceAPI).Assembly);

        // чтобы контроллеры модуля точно подхватились
        services.AddControllers().AddApplicationPart(typeof(OrderServiceAPI).Assembly);

        return services;
    }
}
