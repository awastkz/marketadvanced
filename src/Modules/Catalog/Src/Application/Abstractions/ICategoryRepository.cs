using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Abstractions;

public interface ICategoryRepository
{
    Task<IReadOnlyList<(Category Category, int ProductsCount)>> ListAsync(CancellationToken ct);
    Task<bool> ExistsAsync(int id, CancellationToken ct);
    Task<bool> SlugExistsAsync(string slug, int? exceptId, CancellationToken ct);
    Task<Category?> GetByIdAsync(int id, CancellationToken ct);
    Task<int> ProductsCountAsync(int id, CancellationToken ct);
    Task<bool> HasChildrenAsync(int id, CancellationToken ct);
    Task AddAsync(Category category, CancellationToken ct);
    void Remove(Category category);
    Task SaveChangesAsync(CancellationToken ct);
}
