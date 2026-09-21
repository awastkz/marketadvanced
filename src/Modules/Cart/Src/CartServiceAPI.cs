using MarketAdvanced.Shared.Options;
using MarketAdvanced.Cart.Infrastructure.Services.Catalog;
using MarketAdvanced.Cart.Infrastructure.Repositories;
using MarketAdvanced.Cart.Application.Services.Catalog;
using MarketAdvanced.Cart.Application.Abstractions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MarketAdvanced.Cart.Infrastructure;
using Microsoft.Extensions.Options;

namespace MarketAdvanced.Cart;

public static class CartServiceAPI
{
    public static IServiceCollection AddCartServiceAPI(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CartServiceAPI).Assembly));

        services.AddDbContext<CartDbContext>(
            opt => opt.UseNpgsql(config.GetConnectionString("Postgres"),
            npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "cart")
            ));

            services.AddOptions<CatalogClientOptions>()
      .Bind(config.GetSection("Catalog"))
      .ValidateDataAnnotations()
      .ValidateOnStart();
      
  services.AddHttpClient<ICatalogClient, CatalogHttpClient>((sp, c) =>
  {
      var opt = sp.GetRequiredService<IOptions<CatalogClientOptions>>().Value;
      c.BaseAddress = new Uri(opt.BaseUrl);
      c.Timeout = TimeSpan.FromSeconds(5);
  });
      
        services.AddScoped<ICartRepository, CartRepository>();

        services.AddValidatorsFromAssembly(typeof(CartServiceAPI).Assembly);

        // чтобы контроллеры модуля точно подхватились
        services.AddControllers().AddApplicationPart(typeof(CartServiceAPI).Assembly);

        return services;
    }
}
