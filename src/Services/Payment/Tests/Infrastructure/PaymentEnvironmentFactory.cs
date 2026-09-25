using MarketAdvanced.Payment.Persistence;
using MarketAdvanced.Shared.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Payment.IntegrationTests;

public class PaymentEnvironmentFactory : TestEnvironmentFactory
{
    protected override Task MigrateAsync(IServiceProvider services)
        => services.GetRequiredService<PaymentDbContext>().Database.MigrateAsync();
}
