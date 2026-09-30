namespace MarketAdvanced.Catalog.WebApi.Admin.Products;

public sealed class AttributeValueRequest
{
    public Guid AttributeId { get; set; }
    public string Value { get; set; } = null!;
}
