using MassTransit;

namespace MarketAdvanced.Catalog.Persistence.Messaging;

public static class CatalogOutboxExtensions
{
    /// <summary>Bus outbox на CatalogDbContext: Publish пишет в таблицу OutboxMessage, отправка после SaveChanges.</summary>
    public static void AddCatalogOutbox(this IBusRegistrationConfigurator x) =>
        x.AddEntityFrameworkOutbox<CatalogDbContext>(o =>
        {
            o.UsePostgres();
            o.UseBusOutbox();
        });
}
