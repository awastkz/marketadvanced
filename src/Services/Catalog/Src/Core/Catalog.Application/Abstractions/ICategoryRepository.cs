using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Abstractions;

public interface ICategoryRepository
{
    Task<IReadOnlyList<(Category Category, int ProductsCount)>> ListAsync(CancellationToken ct);
    Task<bool> ExistsAsync(Guid id, CancellationToken ct);
    Task<bool> SlugExistsAsync(string slug, Guid? exceptId, CancellationToken ct);
    Task<Category?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<int> ProductsCountAsync(Guid id, CancellationToken ct);
    Task<bool> HasChildrenAsync(Guid id, CancellationToken ct);
    Task AddAsync(Category category, CancellationToken ct);
    void Remove(Category category);
    Task SaveChangesAsync(CancellationToken ct);
}
