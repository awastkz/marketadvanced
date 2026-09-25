namespace MarketAdvanced.Catalog.Domain;

public class VariantAttributeValue
{
    public int Id { get; set; }

    public string Value { get; set; } = null!;

    public int ProductVariantId { get; set; }

    public ProductVariant ProductVariant { get; set; } = null!;

    public int AttributeId { get; set; }

    public ProductAttribute Attribute { get; set; } = null!;
}
