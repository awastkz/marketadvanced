using MarketAdvanced.Catalog.Application.Features.Products.Images;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Features.Products;

public sealed record AttributeValueResult(int AttributeId, string Value);

public sealed record VariantResult(
    int Id,
    string Sku,
    string? Name,
    decimal Price,
    int Stock,
    bool IsActive,
    IReadOnlyList<AttributeValueResult> Attributes);

public sealed record ProductResult(
    int Id,
    string Name,
    string Slug,
    string? Description,
    int CategoryId,
    int? BrandId,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IReadOnlyList<VariantResult> Variants,
    IReadOnlyList<ProductImageResult> Images,
    IReadOnlyList<AttributeValueResult> Attributes)
{
    /// <summary>Маппинг из агрегата. imageUrl строит публичный адрес по ImagePath.</summary>
    public static ProductResult From(Product p, Func<string, string> imageUrl) => new(
        p.Id,
        p.Name,
        p.Slug,
        p.Description,
        p.CategoryId,
        p.BrandId,
        p.IsActive,
        p.CreatedAt,
        p.UpdatedAt,
        p.Variants
            .Select(v => new VariantResult(
                v.Id, v.Sku, v.Name, v.Price, v.Stock, v.IsActive,
                v.Attributes.Select(a => new AttributeValueResult(a.AttributeId, a.Value)).ToList()))
            .ToList(),
        p.Images
            .OrderBy(i => i.SortOrder)
            .Select(i => new ProductImageResult(i.Id, imageUrl(i.ImagePath), i.Alt, i.SortOrder, i.IsMain))
            .ToList(),
        p.Attributes.Select(a => new AttributeValueResult(a.AttributeId, a.Value)).ToList());
}
