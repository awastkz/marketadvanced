using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Common.Attributes;

public sealed record ProductAttributeResult(int Id, string Name, string Slug, string? Unit, int SortOrder, int UserId)
{
    public static ProductAttributeResult From(ProductAttribute a) => new(a.Id, a.Name, a.Slug, a.Unit, a.SortOrder, a.UserId);
}
