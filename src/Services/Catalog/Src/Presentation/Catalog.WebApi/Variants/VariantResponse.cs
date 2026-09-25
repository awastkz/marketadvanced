using MarketAdvanced.Catalog.Application.Common.Variants;

namespace MarketAdvanced.Catalog.WebApi.Variants;

/// <summary>Публичный контракт GET api/variants/{id}. Поля менять только с оглядкой на потребителей (Cart).</summary>
public sealed record VariantResponse(
    int Id,
    int ProductId,
    string ProductName,
    string Sku,
    string? Name,
    decimal Price,
    int Stock,
    bool IsActive)
{
    public static VariantResponse From(VariantDetailsResult r) => new(
        r.Id, r.ProductId, r.ProductName, r.Sku, r.Name, r.Price, r.Stock, r.IsActive);
}
