namespace MarketAdvanced.Catalog.Domain;

public class ProductAttributeValue
{
    public Guid Id { get; set; }

    public string Value { get; set; } = null!;

    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public Guid AttributeId { get; set; }

    public ProductAttribute Attribute { get; set; } = null!;
}
