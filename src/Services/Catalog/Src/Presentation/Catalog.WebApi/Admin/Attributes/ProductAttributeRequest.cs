namespace MarketAdvanced.Catalog.WebApi.Admin.Attributes;

public sealed class ProductAttributeRequest
{
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Unit { get; set; }
    public int SortOrder { get; set; }
}
