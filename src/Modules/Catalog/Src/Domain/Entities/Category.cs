namespace MarketAdvanced.Catalog.Domain;

public class Category
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? ImagePath { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public int? ParentId { get; set; }

    public Category? Parent { get; set; }

    public ICollection<Category> Children { get; set; } = new List<Category>();

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
