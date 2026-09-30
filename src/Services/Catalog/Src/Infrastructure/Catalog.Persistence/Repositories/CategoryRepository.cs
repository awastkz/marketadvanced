using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Domain;
using Microsoft.EntityFrameworkCore;

namespace MarketAdvanced.Catalog.Persistence.Repositories;

public sealed class CategoryRepository : ICategoryRepository
{
    private readonly CatalogDbContext _db;

    public CategoryRepository(CatalogDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<(Category Category, int ProductsCount)>> ListAsync(CancellationToken ct)
    {
        var rows = await _db.Category
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new { Category = c, ProductsCount = c.Products.Count })
            .ToListAsync(ct);
        return rows.Select(r => (r.Category, r.ProductsCount)).ToList();
    }

    public Task<bool> ExistsAsync(Guid id, CancellationToken ct) => _db.Category.AnyAsync(c => c.Id == id, ct);

    public Task<bool> SlugExistsAsync(string slug, Guid? exceptId, CancellationToken ct) =>
        _db.Category.AnyAsync(c => c.Slug == slug && (exceptId == null || c.Id != exceptId), ct);

    public Task<Category?> GetByIdAsync(Guid id, CancellationToken ct) => _db.Category.FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<int> ProductsCountAsync(Guid id, CancellationToken ct) => _db.Product.CountAsync(p => p.CategoryId == id, ct);

    public Task<bool> HasChildrenAsync(Guid id, CancellationToken ct) => _db.Category.AnyAsync(c => c.ParentId == id, ct);

    public async Task AddAsync(Category category, CancellationToken ct) => await _db.Category.AddAsync(category, ct);

    public void Remove(Category category) => _db.Category.Remove(category);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
