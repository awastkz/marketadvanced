using MassTransit;

namespace MarketAdvanced.Shared.External.Messaging;

/// <summary>
/// Очередь консьюмера с префиксом сервиса из имени сборки: Order.External.VariantCreatedConsumer -> order.variant-created.
/// Без префикса два сервиса, подписанные на одно событие, получили бы одну очередь и делили бы сообщения,
/// а не получали каждый свою копию.
/// </summary>
internal sealed class ServiceEndpointNameFormatter() : KebabCaseEndpointNameFormatter(false)
{
    public override string Consumer<T>() => $"{ServiceOf(typeof(T))}.{base.Consumer<T>()}";

    private static string ServiceOf(Type type) => type.Assembly.GetName().Name!.Split('.')[0].ToLowerInvariant();
}
