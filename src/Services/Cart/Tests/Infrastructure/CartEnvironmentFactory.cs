using MarketAdvanced.Cart.Persistence;
using MarketAdvanced.Shared.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Cart.IntegrationTests;

public class CartEnvironmentFactory : TestEnvironmentFactory
{
    protected override Task MigrateAsync(IServiceProvider services)
        => services.GetRequiredService<CartDbContext>().Database.MigrateAsync();
}
