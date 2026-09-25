using MarketAdvanced.Order.Persistence;
using MarketAdvanced.Shared.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Order.IntegrationTests;

public class OrderEnvironmentFactory : TestEnvironmentFactory
{
    protected override Task MigrateAsync(IServiceProvider services)
        => services.GetRequiredService<OrderDbContext>().Database.MigrateAsync();
}
