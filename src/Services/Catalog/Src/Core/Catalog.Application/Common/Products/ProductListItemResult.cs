using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Common.Products;

/// <summary>Строка списка товаров в админке: без вариантов и характеристик, только сводка.</summary>
public sealed record ProductListItemResult(
    int Id,
    string Name,
    string Slug,
    string? ImageUrl,
    bool IsActive,
    int CategoryId,
    string CategoryName,
    string? BrandName,
    int VariantsCount,
    decimal? MinPrice,
    int TotalStock,
    DateTime? UpdatedAt,
    DateTime CreatedAt)
{
    public static ProductListItemResult From(Product p, Func<string, string> imageUrl)
    {
        var active = p.Variants.Where(v => v.IsActive).ToList();
        var priced = active.Count > 0 ? active : p.Variants.ToList();
        var main = p.Images.FirstOrDefault(i => i.IsMain) ?? p.Images.OrderBy(i => i.SortOrder).FirstOrDefault();

        return new(
            p.Id,
            p.Name,
            p.Slug,
            main is null ? null : imageUrl(main.ImagePath),
            p.IsActive,
            p.CategoryId,
            p.Category.Name,
            p.Brand?.Name,
            p.Variants.Count,
            priced.Count > 0 ? priced.Min(v => v.Price) : null,
            p.Variants.Sum(v => v.Stock),
            p.UpdatedAt,
            p.CreatedAt);
    }
}
