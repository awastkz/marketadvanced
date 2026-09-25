namespace MarketAdvanced.Shared.Application.Messaging;

/// <summary>Публикация integration events из Application-слоя без зависимости от MassTransit.</summary>
public interface IEventPublisher
{
    Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class;
}
