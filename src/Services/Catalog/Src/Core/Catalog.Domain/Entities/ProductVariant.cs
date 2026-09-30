namespace MarketAdvanced.Catalog.Domain;

public class ProductVariant
{
    public Guid Id { get; set; }

    public string Sku { get; set; } = null!;

    public string? Name { get; set; }

    public decimal Price { get; set; }

    public int Stock { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public ICollection<VariantAttributeValue> Attributes { get; set; } = new List<VariantAttributeValue>();
    public ICollection<ProductImage> Images {get;set;} = new List<ProductImage>();
}
