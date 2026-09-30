namespace MarketAdvanced.Catalog.Domain;

public class VariantAttributeValue
{
    public Guid Id { get; set; }

    public string Value { get; set; } = null!;

    public Guid ProductVariantId { get; set; }

    public ProductVariant ProductVariant { get; set; } = null!;

    public Guid AttributeId { get; set; }

    public ProductAttribute Attribute { get; set; } = null!;
}
