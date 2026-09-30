namespace MarketAdvanced.Catalog.WebApi.Admin.Products;

public sealed class ProductRequest
{
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
    public Guid? BrandId { get; set; }
    public bool IsActive { get; set; } = true;
    public List<ProductVariantRequest> Variants { get; set; } = new();
    public List<AttributeValueRequest> Attributes { get; set; } = new();
}
