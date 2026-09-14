using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Features.Attributes;

public sealed record ProductAttributeResult(int Id, string Name, string Slug, string? Unit, int SortOrder)
{
    public static ProductAttributeResult From(ProductAttribute a) => new(a.Id, a.Name, a.Slug, a.Unit, a.SortOrder);
}
