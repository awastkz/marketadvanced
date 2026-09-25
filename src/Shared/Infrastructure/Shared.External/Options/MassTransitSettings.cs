namespace MarketAdvanced.Shared.External.Options;

/// <summary>Секция MassTransit: api и catalog только публикуют, worker поднимает консьюмеры.</summary>
public sealed class MassTransitSettings
{
    /// <summary>false — только publish, receive endpoints не создаются.</summary>
    public bool Consumers { get; set; }
    public int PrefetchCount { get; set; } = 16;
}
