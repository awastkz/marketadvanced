using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MarketAdvanced.Shared.Options;
using MarketAdvanced.Catalog.Infrastructure;
using MarketAdvanced.Catalog.Api.Filters;
using Microsoft.AspNetCore.Mvc;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Infrastructure.Repositories;

namespace MarketAdvanced.Catalog;

public static class CatalogModule
{
    public static IServiceCollection AddCatalogModule(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CatalogModule).Assembly));

        services.AddDbContext<CatalogDbContext>(
            opt => opt.UseNpgsql(config.GetConnectionString("Postgres"),
            npsql => npsql.MigrationsHistoryTable("__EFMigrationsHistory", "catalog")
            ));
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<IProductAttributeRepository, ProductAttributeRepository>();
services.AddValidatorsFromAssembly(typeof(CatalogModule).Assembly);
        // NotFoundException -> 404, ConflictException -> 409, тело { message }
        services.Configure<MvcOptions>(o => o.Filters.Add<ApiExceptionFilter>());

          // чтобы контроллеры модуля точно подхватились
          services.AddControllers().AddApplicationPart(typeof(CatalogModule).Assembly);

          return services;
    }
}