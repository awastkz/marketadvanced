using MarketAdvanced.Shared.Application.Messaging;
using MassTransit;

namespace MarketAdvanced.Shared.External.Messaging;

internal sealed class MassTransitEventPublisher : IEventPublisher
{
    private readonly IPublishEndpoint _publishEndpoint;

    public MassTransitEventPublisher(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class
        => _publishEndpoint.Publish(@event, cancellationToken);
}
