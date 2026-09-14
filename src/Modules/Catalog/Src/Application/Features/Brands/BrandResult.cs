using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Features.Brands;

public sealed record BrandResult(
    int Id,
    string Name,
    string Slug,
    string? Description,
    string? LogoUrl,
    int ProductsCount)
{
    // LogoUrl появится вместе с S3-хранилищем, пока отдаём путь как есть
    public static BrandResult From(Brand b, int productsCount) =>
        new(b.Id, b.Name, b.Slug, b.Description, b.LogoPath, productsCount);
}
