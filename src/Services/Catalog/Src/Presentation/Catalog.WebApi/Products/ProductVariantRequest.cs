namespace MarketAdvanced.Catalog.WebApi.Products;

public sealed class ProductVariantRequest
{
    /// <summary>null — новый вариант, число — обновить существующий.</summary>
    public int? Id { get; set; }
    public string Sku { get; set; } = null!;
    public string? Name { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public bool IsActive { get; set; } = true;
    public List<AttributeValueRequest> Attributes { get; set; } = new();
}
