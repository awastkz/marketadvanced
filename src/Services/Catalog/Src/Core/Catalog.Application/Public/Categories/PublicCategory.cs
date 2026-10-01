using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Public.Categories;

/// <summary>Категория на витрине: без UserId и счётчиков админки.</summary>
public sealed record PublicCategory(
    Guid Id,
    string Name,
    string Slug,
    string? ImageUrl,
    int SortOrder,
    Guid? ParentId)
{
    // ImageUrl появится вместе с S3-хранилищем, пока отдаём путь как есть
    public static PublicCategory From(Category c) => new(c.Id, c.Name, c.Slug, c.ImagePath, c.SortOrder, c.ParentId);
}
