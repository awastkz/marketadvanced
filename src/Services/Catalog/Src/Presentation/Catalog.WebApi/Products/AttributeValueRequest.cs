namespace MarketAdvanced.Catalog.WebApi.Products;

public sealed class AttributeValueRequest
{
    public int AttributeId { get; set; }
    public string Value { get; set; } = null!;
}
