using MarketAdvanced.Shared.Application.Behaviors;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MarketAdvanced.Payment.Persistence;

namespace MarketAdvanced.Payment.WebApi;

public static class PaymentServiceAPI
{
    public static IServiceCollection AddPaymentServiceAPI(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Application.AssemblyReference.Assembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddDbContext<PaymentDbContext>(
            opt => opt.UseNpgsql(config.GetConnectionString("Postgres"),
            npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "payment")
            ));

        services.AddValidatorsFromAssembly(Application.AssemblyReference.Assembly);

        // чтобы контроллеры модуля точно подхватились
        services.AddControllers().AddApplicationPart(typeof(PaymentServiceAPI).Assembly);

        return services;
    }
}
