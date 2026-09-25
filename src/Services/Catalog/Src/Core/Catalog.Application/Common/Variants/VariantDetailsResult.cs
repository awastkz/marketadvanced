using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Common.Variants;

/// <summary>Вариант для внешних потребителей (Cart, Order). Не зависит от админского VariantResult.</summary>
public sealed record VariantDetailsResult(
    int Id,
    int ProductId,
    string ProductName,
    string Sku,
    string? Name,
    decimal Price,
    int Stock,
    bool IsActive)
{
    public static VariantDetailsResult From(ProductVariant v) => new(
        v.Id,
        v.ProductId,
        v.Product.Name,
        v.Sku,
        v.Name,
        v.Price,
        v.Stock,
        v.IsActive);
}
