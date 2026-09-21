namespace MarketAdvanced.Catalog.Domain;

public class ProductAttribute
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Unit { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Id пользователя из Identity, без внешнего ключа: модули не ссылаются друг на друга.</summary>
    public int UserId { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public ICollection<ProductAttributeValue> Values { get; set; } = new List<ProductAttributeValue>();

    public ICollection<VariantAttributeValue> VariantValues { get; set; } = new List<VariantAttributeValue>();
}
