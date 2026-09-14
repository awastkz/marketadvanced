namespace MarketAdvanced.Catalog.Api.Requests;

public sealed class ProductRequest
{
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public int? BrandId { get; set; }
    public bool IsActive { get; set; } = true;
    public List<ProductVariantRequest> Variants { get; set; } = new();
    public List<AttributeValueRequest> Attributes { get; set; } = new();
}
