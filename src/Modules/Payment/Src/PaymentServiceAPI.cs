using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MarketAdvanced.Payment.Infrastructure;

namespace MarketAdvanced.Payment;

public static class PaymentServiceAPI
{
    public static IServiceCollection AddPaymentServiceAPI(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(PaymentServiceAPI).Assembly));

        services.AddDbContext<PaymentDbContext>(
            opt => opt.UseNpgsql(config.GetConnectionString("Postgres"),
            npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "payment")
            ));

        services.AddValidatorsFromAssembly(typeof(PaymentServiceAPI).Assembly);

        // чтобы контроллеры модуля точно подхватились
        services.AddControllers().AddApplicationPart(typeof(PaymentServiceAPI).Assembly);

        return services;
    }
}
