using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Abstractions;

public interface IProductAttributeRepository
{
    Task<IReadOnlyList<ProductAttribute>> ListAsync(CancellationToken ct);
    /// <summary>Какие из переданных id существуют в справочнике.</summary>
    Task<IReadOnlyList<Guid>> ExistingIdsAsync(IEnumerable<Guid> ids, CancellationToken ct);
    Task<bool> SlugExistsAsync(string slug, Guid? exceptId, CancellationToken ct);
    Task<ProductAttribute?> GetByIdAsync(Guid id, CancellationToken ct);
    /// <summary>Есть ли значения этого атрибута у товаров или вариантов.</summary>
    Task<bool> IsUsedAsync(Guid id, CancellationToken ct);
    Task AddAsync(ProductAttribute attribute, CancellationToken ct);
    void Remove(ProductAttribute attribute);
    Task SaveChangesAsync(CancellationToken ct);
}
