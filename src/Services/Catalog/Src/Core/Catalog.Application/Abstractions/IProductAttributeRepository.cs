using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Abstractions;

public interface IProductAttributeRepository
{
    Task<IReadOnlyList<ProductAttribute>> ListAsync(CancellationToken ct);
    /// <summary>Какие из переданных id существуют в справочнике.</summary>
    Task<IReadOnlyList<int>> ExistingIdsAsync(IEnumerable<int> ids, CancellationToken ct);
    Task<bool> SlugExistsAsync(string slug, int? exceptId, CancellationToken ct);
    Task<ProductAttribute?> GetByIdAsync(int id, CancellationToken ct);
    /// <summary>Есть ли значения этого атрибута у товаров или вариантов.</summary>
    Task<bool> IsUsedAsync(int id, CancellationToken ct);
    Task AddAsync(ProductAttribute attribute, CancellationToken ct);
    void Remove(ProductAttribute attribute);
    Task SaveChangesAsync(CancellationToken ct);
}
