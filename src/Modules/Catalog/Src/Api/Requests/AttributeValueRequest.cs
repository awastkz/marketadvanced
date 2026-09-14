namespace MarketAdvanced.Catalog.Api.Requests;

public sealed class AttributeValueRequest
{
    public int AttributeId { get; set; }
    public string Value { get; set; } = null!;
}
