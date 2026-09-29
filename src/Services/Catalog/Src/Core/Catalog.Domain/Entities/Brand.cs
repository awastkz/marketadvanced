namespace MarketAdvanced.Catalog.Domain;

public class Brand
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Description { get; set; }

    public string? LogoPath { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Id пользователя из Identity, без внешнего ключа: модули не ссылаются друг на друга.</summary>
    public Guid UserId { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
