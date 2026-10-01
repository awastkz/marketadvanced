using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Public.Products;

/// <summary>Карточка товара на витрине: без остатков, флагов активности и служебных полей.</summary>
public sealed record PublicProductCard(
    Guid Id,
    string Name,
    string Slug,
    string? ImageUrl,
    string CategoryName,
    string? BrandName,
    int VariantsCount,
    decimal MinPrice,
    bool InStock)
{
    /// <summary>Только по активным вариантам: неактивные покупатель не видит. Товар без них в выборку не попадает.</summary>
    public static PublicProductCard From(Product p, Func<string, string> imageUrl)
    {
        var active = p.Variants.Where(v => v.IsActive).ToList();
        var main = p.Images.FirstOrDefault(i => i.IsMain) ?? p.Images.OrderBy(i => i.SortOrder).FirstOrDefault();

        return new(
            p.Id,
            p.Name,
            p.Slug,
            main is null ? null : imageUrl(main.ImagePath),
            p.Category.Name,
            p.Brand?.Name,
            active.Count,
            active.Min(v => v.Price),
            active.Any(v => v.Stock > 0));
    }
}
