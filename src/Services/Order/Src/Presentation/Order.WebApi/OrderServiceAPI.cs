using MarketAdvanced.Shared.Application.Behaviors;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MarketAdvanced.Order.Persistence;
using MarketAdvanced.Order.Persistence.Repositories;
using MarketAdvanced.Order.Application.Abstractions;
using MarketAdvanced.Order.Application.Services.Catalog;
using MarketAdvanced.Order.External.Options;
using MarketAdvanced.Order.External.Services.Catalog;
using Microsoft.Extensions.Options;

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

        services.AddScoped<IOrderRepository, OrderRepository>();

        services.AddValidatorsFromAssembly(Application.AssemblyReference.Assembly);

        services.AddOptions<CatalogOptions>()
            .Bind(config.GetSection("Catalog"))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        // имя задано явно: по умолчанию оно берётся из имени типа без namespace и совпадает с ICatalogClient из Cart,
        // а в dev все сервисы живут в одном процессе
        services.AddHttpClient<ICatalogClient, CatalogHttpClient>("Order.CatalogClient", (sp, c) =>
        {
            var opt = sp.GetRequiredService<IOptions<CatalogOptions>>().Value;
            c.BaseAddress = new Uri(opt.BaseUrl);
            c.Timeout = TimeSpan.FromSeconds(5);
        });

        // чтобы контроллеры модуля точно подхватились
        services.AddControllers().AddApplicationPart(typeof(OrderServiceAPI).Assembly);

        return services;
    }
}
