namespace MarketAdvanced.Catalog.Application.Features.Products;

public sealed record AttributeValueInput(int AttributeId, string Value);

public sealed record VariantInput(
    int? Id,
    string Sku,
    string? Name,
    decimal Price,
    int Stock,
    bool IsActive,
    IReadOnlyList<AttributeValueInput> Attributes);
