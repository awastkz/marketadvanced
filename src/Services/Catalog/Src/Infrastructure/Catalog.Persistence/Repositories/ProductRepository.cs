using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Domain;
using Microsoft.EntityFrameworkCore;

namespace MarketAdvanced.Catalog.Persistence.Repositories;

public sealed class ProductRepository : IProductRepository
{
    private readonly CatalogDbContext _db;

    public ProductRepository(CatalogDbContext db)
    {
        _db = db;
    }

    public Task<Product?> GetWithDetailsAsync(int id, CancellationToken ct) =>
        _db.Product
            .Include(p => p.Variants).ThenInclude(v => v.Attributes)
            .Include(p => p.Images)
            .Include(p => p.Attributes)
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<ProductVariant?> GetVariantAsync(int variantId, CancellationToken ct) =>
        _db.ProductVariant
            .AsNoTracking()
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == variantId, ct);

    public async Task<IReadOnlyList<ProductVariant>> GetVariantsAsync(IReadOnlyCollection<int> variantIds, CancellationToken ct) =>
        await _db.ProductVariant
            .AsNoTracking()
            .Include(v => v.Product)
            .Where(v => variantIds.Contains(v.Id))
            .ToListAsync(ct);

    public Task<bool> SlugExistsAsync(string slug, int? exceptProductId, CancellationToken ct) =>
        _db.Product.AnyAsync(p => p.Slug == slug && (exceptProductId == null || p.Id != exceptProductId), ct);

    public async Task<IReadOnlyList<string>> TakenSkusAsync(IEnumerable<string> skus, int? exceptProductId, CancellationToken ct)
    {
        var list = skus.ToList();
        return await _db.ProductVariant
            .Where(v => list.Contains(v.Sku) && (exceptProductId == null || v.ProductId != exceptProductId))
            .Select(v => v.Sku)
            .ToListAsync(ct);
    }

    public async Task<(IReadOnlyList<Product> Items, int Total)> SearchAsync(ProductFilter f, CancellationToken ct)
    {
        IQueryable<Product> q = _db.Product;

        if (!string.IsNullOrWhiteSpace(f.Search))
        {
            var s = f.Search.Trim();
            q = q.Where(p => EF.Functions.ILike(p.Name, $"%{s}%") || EF.Functions.ILike(p.Slug, $"%{s}%"));
        }
        if (f.CategoryIds is { Count: > 0 }) q = q.Where(p => f.CategoryIds.Contains(p.CategoryId));
        if (f.BrandId is not null) q = q.Where(p => p.BrandId == f.BrandId);
        if (f.IsActive is not null) q = q.Where(p => p.IsActive == f.IsActive);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(p => p.UpdatedAt ?? p.CreatedAt)
            .Skip((f.Page - 1) * f.PageSize)
            .Take(f.PageSize)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Variants)
            .Include(p => p.Images)
            .AsSplitQuery()
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task AddAsync(Product product, CancellationToken ct)
    {
        _db.Product.Add(product);
        await _db.SaveChangesAsync(ct);
    }

    public void Remove(Product product) => _db.Product.Remove(product);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
