namespace MarketAdvanced.Catalog.Application.Common.Products;

public sealed record AttributeValueInput(int AttributeId, string Value);

public sealed record VariantInput(
    int? Id,
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
    int CategoryId { get; }
    int? BrandId { get; }
    IReadOnlyList<VariantInput> Variants { get; }
    IReadOnlyList<AttributeValueInput> Attributes { get; }
}
