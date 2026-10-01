using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Public.Products;

public sealed record PublicAttributeValue(Guid AttributeId, string Name, string Value, string? Unit);

public sealed record PublicProductImage(string Url, string? Alt, bool IsMain);

/// <summary>Вариант на витрине: только активные, наличие вместо точного остатка.</summary>
public sealed record PublicProductVariant(
    Guid Id,
    string Sku,
    string? Name,
    decimal Price,
    bool InStock,
    IReadOnlyList<PublicAttributeValue> Attributes);

/// <summary>Страница товара на витрине.</summary>
public sealed record PublicProductDetails(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    Guid CategoryId,
    string CategoryName,
    string? BrandName,
    IReadOnlyList<PublicProductImage> Images,
    IReadOnlyList<PublicAttributeValue> Attributes,
    IReadOnlyList<PublicProductVariant> Variants)
{
    /// <summary>Только активные варианты. Значения атрибутов берут имя и единицу из справочника (Attribute должен быть загружен).</summary>
    public static PublicProductDetails From(Product p, Func<string, string> imageUrl) => new(
        p.Id,
        p.Name,
        p.Slug,
        p.Description,
        p.CategoryId,
        p.Category.Name,
        p.Brand?.Name,
        p.Images
            .OrderByDescending(i => i.IsMain).ThenBy(i => i.SortOrder)
            .Select(i => new PublicProductImage(imageUrl(i.ImagePath), i.Alt, i.IsMain))
            .ToList(),
        p.Attributes
            .OrderBy(a => a.Attribute.SortOrder)
            .Select(a => new PublicAttributeValue(a.AttributeId, a.Attribute.Name, a.Value, a.Attribute.Unit))
            .ToList(),
        p.Variants
            .Where(v => v.IsActive)
            .OrderBy(v => v.Price).ThenBy(v => v.Sku)
            .Select(v => new PublicProductVariant(
                v.Id,
                v.Sku,
                v.Name,
                v.Price,
                v.Stock > 0,
                v.Attributes
                    .OrderBy(a => a.Attribute.SortOrder)
                    .Select(a => new PublicAttributeValue(a.AttributeId, a.Attribute.Name, a.Value, a.Attribute.Unit))
                    .ToList()))
            .ToList());
}
