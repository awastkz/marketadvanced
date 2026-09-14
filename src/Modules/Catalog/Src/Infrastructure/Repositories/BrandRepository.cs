using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Domain;
using Microsoft.EntityFrameworkCore;

namespace MarketAdvanced.Catalog.Infrastructure.Repositories;

public sealed class BrandRepository : IBrandRepository
{
    private readonly CatalogDbContext _db;

    public BrandRepository(CatalogDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<(Brand Brand, int ProductsCount)>> ListAsync(CancellationToken ct)
    {
        var rows = await _db.Brand
            .OrderBy(b => b.Name)
            .Select(b => new { Brand = b, ProductsCount = b.Products.Count })
            .ToListAsync(ct);
        return rows.Select(r => (r.Brand, r.ProductsCount)).ToList();
    }

    public Task<bool> ExistsAsync(int id, CancellationToken ct) => _db.Brand.AnyAsync(b => b.Id == id, ct);

    public Task<bool> SlugExistsAsync(string slug, int? exceptId, CancellationToken ct) =>
        _db.Brand.AnyAsync(b => b.Slug == slug && (exceptId == null || b.Id != exceptId), ct);

    public Task<Brand?> GetByIdAsync(int id, CancellationToken ct) => _db.Brand.FirstOrDefaultAsync(b => b.Id == id, ct);

    public Task<int> ProductsCountAsync(int id, CancellationToken ct) => _db.Product.CountAsync(p => p.BrandId == id, ct);

    public async Task AddAsync(Brand brand, CancellationToken ct)
    {
        _db.Brand.Add(brand);
        await _db.SaveChangesAsync(ct);
    }

    public void Remove(Brand brand) => _db.Brand.Remove(brand);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
