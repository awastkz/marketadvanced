using MassTransit;

namespace MarketAdvanced.Catalog.Application.IntegrationEvents;

/// <summary>Товар создан вместе с вариантами. Контракт: contracts/schemas/catalog/product-created.v1.json</summary>
[EntityName("catalog.product-created.v1")]
public sealed record ProductCreatedV1
{
    public required Guid EventId { get; init; }
    public required DateTime OccurredAt { get; init; }
    public required Guid ProductId { get; init; }
    public required string Name { get; init; }
    public required string Slug { get; init; }
    public required Guid CategoryId { get; init; }
    public Guid? BrandId { get; init; }
    public required bool IsActive { get; init; }
    public required IReadOnlyList<ProductVariantV1> Variants { get; init; }
}

public sealed record ProductVariantV1
{
    public required Guid VariantId { get; init; }
    public required string Sku { get; init; }
    public string? Name { get; init; }
    /// <summary>Цена в тиынах.</summary>
    public required long Price { get; init; }
    public required bool IsActive { get; init; }
}
