using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Features.Categories;

public sealed record CategoryResult(
    int Id,
    string Name,
    string Slug,
    string? ImageUrl,
    int SortOrder,
    int? ParentId,
    int ProductsCount)
{
    // ImageUrl появится вместе с S3-хранилищем, пока отдаём путь как есть
    public static CategoryResult From(Category c, int productsCount) =>
        new(c.Id, c.Name, c.Slug, c.ImagePath, c.SortOrder, c.ParentId, productsCount);
}
