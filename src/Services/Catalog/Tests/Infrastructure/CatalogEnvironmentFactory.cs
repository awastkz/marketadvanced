using MarketAdvanced.Catalog.Persistence;
using MarketAdvanced.Shared.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Catalog.IntegrationTests;

public class CatalogEnvironmentFactory : TestEnvironmentFactory
{
    protected override Task MigrateAsync(IServiceProvider services)
        => services.GetRequiredService<CatalogDbContext>().Database.MigrateAsync();
}
