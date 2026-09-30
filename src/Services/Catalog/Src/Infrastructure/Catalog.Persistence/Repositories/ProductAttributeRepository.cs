using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Domain;
using Microsoft.EntityFrameworkCore;

namespace MarketAdvanced.Catalog.Persistence.Repositories;

public sealed class ProductAttributeRepository : IProductAttributeRepository
{
    private readonly CatalogDbContext _db;

    public ProductAttributeRepository(CatalogDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ProductAttribute>> ListAsync(CancellationToken ct) =>
        await _db.ProductAttribute.OrderBy(a => a.SortOrder).ThenBy(a => a.Name).ToListAsync(ct);

    public async Task<IReadOnlyList<Guid>> ExistingIdsAsync(IEnumerable<Guid> ids, CancellationToken ct)
    {
        var list = ids.Distinct().ToList();
        return await _db.ProductAttribute.Where(a => list.Contains(a.Id)).Select(a => a.Id).ToListAsync(ct);
    }

    public Task<bool> SlugExistsAsync(string slug, Guid? exceptId, CancellationToken ct) =>
        _db.ProductAttribute.AnyAsync(a => a.Slug == slug && (exceptId == null || a.Id != exceptId), ct);

    public Task<ProductAttribute?> GetByIdAsync(Guid id, CancellationToken ct) => _db.ProductAttribute.FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<bool> IsUsedAsync(Guid id, CancellationToken ct) =>
        await _db.ProductAttributeValue.AnyAsync(v => v.AttributeId == id, ct)
        || await _db.VariantAttributeValue.AnyAsync(v => v.AttributeId == id, ct);

    public async Task AddAsync(ProductAttribute attribute, CancellationToken ct) => await _db.ProductAttribute.AddAsync(attribute, ct);

    public void Remove(ProductAttribute attribute) => _db.ProductAttribute.Remove(attribute);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
