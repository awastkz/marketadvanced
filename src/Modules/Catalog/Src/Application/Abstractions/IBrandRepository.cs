using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Abstractions;

public interface IBrandRepository
{
    Task<IReadOnlyList<(Brand Brand, int ProductsCount)>> ListAsync(CancellationToken ct);
    Task<bool> ExistsAsync(int id, CancellationToken ct);
    Task<bool> SlugExistsAsync(string slug, int? exceptId, CancellationToken ct);
    Task<Brand?> GetByIdAsync(int id, CancellationToken ct);
    Task<int> ProductsCountAsync(int id, CancellationToken ct);
    Task AddAsync(Brand brand, CancellationToken ct);
    void Remove(Brand brand);
    Task SaveChangesAsync(CancellationToken ct);
}
