namespace MarketAdvanced.Order.Application.Services.Catalog;

public interface ICatalogClient
{
    Task<IReadOnlyList<ProductVariantDTO>> GetVariantsAsync(List<Guid> ids, CancellationToken ct = default);
}
