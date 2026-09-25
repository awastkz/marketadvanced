namespace MarketAdvanced.Catalog.WebApi.Admin.Categories;

/// <summary>Приходит как multipart/form-data: фронт шлёт FormData ради картинки.</summary>
public sealed class CategoryRequest
{
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public int SortOrder { get; set; }
    public int? ParentId { get; set; }
    /// <summary>Пока не обрабатывается: появится вместе с S3-хранилищем.</summary>
    public IFormFile? Image { get; set; }
    public bool RemoveImage { get; set; }
}
