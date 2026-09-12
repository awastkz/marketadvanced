using MarketAdvanced.Identity.Infrastructure;
using MarketAdvanced.Shared.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Identity.IntegrationTests;

public class IdentityEnvironmentFactory : TestEnvironmentFactory
{
    protected override Task MigrateAsync(IServiceProvider services)
        => services.GetRequiredService<IdentityDbContext>().Database.MigrateAsync();
}
