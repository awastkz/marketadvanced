namespace MarketAdvanced.Catalog.WebApi.Brands;

/// <summary>Приходит как multipart/form-data: фронт шлёт FormData ради логотипа.</summary>
public sealed class BrandRequest
{
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Description { get; set; }
    /// <summary>Пока не обрабатывается: появится вместе с S3-хранилищем.</summary>
    public IFormFile? Logo { get; set; }
    public bool RemoveLogo { get; set; }
}
