namespace MarketAdvanced.Catalog.Domain;

public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Description { get; set; }

    public string? ImagePath { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Id пользователя из Identity, без внешнего ключа: модули не ссылаются друг на друга.</summary>
    public int UserId { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int CategoryId { get; set; }

    public Category Category { get; set; } = null!;

    public int? BrandId { get; set; }

    public Brand? Brand { get; set; }

    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

    public ICollection<ProductAttributeValue> Attributes { get; set; } = new List<ProductAttributeValue>();
}
