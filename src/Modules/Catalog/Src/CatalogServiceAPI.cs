using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MarketAdvanced.Shared.Options;
using MarketAdvanced.Catalog.Infrastructure;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Infrastructure.Repositories;

namespace MarketAdvanced.Catalog;

public static class CatalogServiceAPI
{
    public static IServiceCollection AddCatalogServiceAPI(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CatalogServiceAPI).Assembly));

        services.AddDbContext<CatalogDbContext>(
            opt => opt.UseNpgsql(config.GetConnectionString("Postgres"),
            npsql => npsql.MigrationsHistoryTable("__EFMigrationsHistory", "catalog")
            ));
            
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<IProductAttributeRepository, ProductAttributeRepository>();

services.AddValidatorsFromAssembly(typeof(CatalogServiceAPI).Assembly);

          // чтобы контроллеры модуля точно подхватились
          services.AddControllers().AddApplicationPart(typeof(CatalogServiceAPI).Assembly);

          return services;
    }
}