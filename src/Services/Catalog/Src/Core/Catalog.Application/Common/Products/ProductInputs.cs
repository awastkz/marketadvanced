namespace MarketAdvanced.Catalog.Application.Common.Products;

public sealed record AttributeValueInput(Guid AttributeId, string Value);

public sealed record VariantInput(
    Guid? Id,
    string Sku,
    string? Name,
    decimal Price,
    int Stock,
    bool IsActive,
    IReadOnlyList<AttributeValueInput> Attributes);

/// <summary>Общие поля Create/UpdateProductCommand: по нему валидируются обе команды.</summary>
public interface IProductInput
{
    string Name { get; }
    string Slug { get; }
    string? Description { get; }
    Guid CategoryId { get; }
    Guid? BrandId { get; }
    IReadOnlyList<VariantInput> Variants { get; }
    IReadOnlyList<AttributeValueInput> Attributes { get; }
}
