namespace MarketAdvanced.Cart.Application.Services.Catalog;

public interface ICatalogClient
{
    Task<ProductVariantDTO?> GetVariantAsync(Guid id, CancellationToken ct = default);

    /// <summary>Варианты по списку id одним запросом. Неизвестные id в ответ не попадают.</summary>
    Task<IReadOnlyList<ProductVariantDTO>> GetVariantsAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct = default);
}
