namespace MarketAdvanced.Cart.Application.Services.Catalog;

public interface ICatalogClient
{
    Task<ProductVariantDTO?> getProductAsync(int id, CancellationToken ct = default);

    /// <summary>Варианты по списку id одним запросом. Неизвестные id в ответ не попадают.</summary>
    Task<IReadOnlyList<ProductVariantDTO>> getVariantsAsync(IReadOnlyCollection<int> ids, CancellationToken ct = default);
}
