namespace MarketAdvanced.Catalog.Domain;

public class ProductAttributeValue
{
    public int Id { get; set; }

    public string Value { get; set; } = null!;

    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public int AttributeId { get; set; }

    public ProductAttribute Attribute { get; set; } = null!;
}
