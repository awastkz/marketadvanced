using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Application.Public.Products;
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

    public Task<Product?> GetWithDetailsAsync(Guid id, CancellationToken ct) =>
        _db.Product
            .Include(p => p.Variants).ThenInclude(v => v.Attributes)
            .Include(p => p.Images)
            .Include(p => p.Attributes)
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<Product?> GetBySlugWithDetailsAsync(string slug, CancellationToken ct) =>
        _db.Product
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Variants).ThenInclude(v => v.Attributes).ThenInclude(a => a.Attribute)
            .Include(p => p.Images)
            .Include(p => p.Attributes).ThenInclude(a => a.Attribute)
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Slug == slug, ct);

    public Task<ProductVariant?> GetVariantAsync(Guid variantId, CancellationToken ct) =>
        _db.ProductVariant
            .AsNoTracking()
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == variantId, ct);

    public async Task<IReadOnlyList<ProductVariant>> GetVariantsAsync(IReadOnlyCollection<Guid> variantIds, CancellationToken ct) =>
        await _db.ProductVariant
            .AsNoTracking()
            .Include(v => v.Product)
            .Where(v => variantIds.Contains(v.Id))
            .ToListAsync(ct);

    public Task<bool> SlugExistsAsync(string slug, Guid? exceptProductId, CancellationToken ct) =>
        _db.Product.AnyAsync(p => p.Slug == slug && (exceptProductId == null || p.Id != exceptProductId), ct);

    public async Task<IReadOnlyList<string>> TakenSkusAsync(IEnumerable<string> skus, Guid? exceptProductId, CancellationToken ct)
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

    public async Task<(IReadOnlyList<Product> Items, int Total)> SearchPublicAsync(PublicProductFilter f, CancellationToken ct)
    {
        IQueryable<Product> q = _db.Product
            .AsNoTracking()
            .Where(p => p.IsActive && p.Variants.Any(v => v.IsActive));

        if (!string.IsNullOrWhiteSpace(f.Search))
            q = q.Where(p => EF.Functions.ILike(p.Name, $"%{f.Search}%"));
        if (f.CategoryIds is { Count: > 0 }) q = q.Where(p => f.CategoryIds.Contains(p.CategoryId));
        if (f.BrandId is not null) q = q.Where(p => p.BrandId == f.BrandId);

        var total = await q.CountAsync(ct);

        // Id вторым ключом: без него товары с одинаковой ценой или датой перемешиваются между страницами
        q = f.Sort switch
        {
            PublicProductSort.PriceAsc => q
                .OrderBy(p => p.Variants.Where(v => v.IsActive).Min(v => v.Price))
                .ThenBy(p => p.Id),
            PublicProductSort.PriceDesc => q
                .OrderByDescending(p => p.Variants.Where(v => v.IsActive).Min(v => v.Price))
                .ThenByDescending(p => p.Id),
            _ => q
                .OrderByDescending(p => p.CreatedAt)
                .ThenByDescending(p => p.Id),
        };

        var items = await q
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

    public async Task AddAsync(Product product, CancellationToken ct) => await _db.Product.AddAsync(product, ct);

    public void Remove(Product product) => _db.Product.Remove(product);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
