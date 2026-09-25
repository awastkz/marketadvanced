using MarketAdvanced.Shared.Application.Behaviors;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MarketAdvanced.Shared.External.Options;
using MarketAdvanced.Catalog.Persistence;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Persistence.Repositories;
using MarketAdvanced.Catalog.Domain;
using MarketAdvanced.Shared.Persistence.Exporter;

namespace MarketAdvanced.Catalog.WebApi;

public static class CatalogServiceAPI
{
    public static IServiceCollection AddCatalogServiceAPI(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Application.AssemblyReference.Assembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddDbContext<CatalogDbContext>(
            opt => opt.UseNpgsql(config.GetConnectionString("Postgres"),
            npsql => npsql.MigrationsHistoryTable("__EFMigrationsHistory", "catalog")
            ));
            
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<IProductAttributeRepository, ProductAttributeRepository>();

        // простые: одна строка, без класса
        services.AddExport<Brand, CatalogDbContext>("brands");
        services.AddExport<Category, CatalogDbContext>("categories");
        services.AddExport<ProductAttribute, CatalogDbContext>("attributes");

        services.AddValidatorsFromAssembly(Application.AssemblyReference.Assembly);

        // чтобы контроллеры модуля точно подхватились
        services.AddControllers().AddApplicationPart(typeof(CatalogServiceAPI).Assembly);

        return services;
    }
}