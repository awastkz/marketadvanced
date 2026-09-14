namespace MarketAdvanced.Catalog.Domain;

public class ProductImage
{
    public int Id { get; set; }

    public string ImagePath { get; set; } = null!;

    public string? Alt { get; set; }

    public int SortOrder { get; set; }

    public bool IsMain { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public int? ProductVariantId { get; set; }

    public ProductVariant? ProductVariant { get; set; }
}
