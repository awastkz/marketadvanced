using MarketAdvanced.Catalog.Application.Public.Products;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Abstractions;

public sealed record ProductFilter(
    string? Search,
    IReadOnlyCollection<Guid>? CategoryIds,
    Guid? BrandId,
    bool? IsActive,
    int Page,
    int PageSize);

/// <summary>Фильтр витрины: активность товара и вариантов проверяет сам репозиторий.</summary>
public sealed record PublicProductFilter(
    string? Search,
    IReadOnlyCollection<Guid>? CategoryIds,
    Guid? BrandId,
    PublicProductSort Sort,
    int Page,
    int PageSize);

public interface IProductRepository
{
    /// <summary>Товар со всеми вложенностями: варианты и их признаки, фото, характеристики.</summary>
    Task<Product?> GetWithDetailsAsync(Guid id, CancellationToken ct);

    /// <summary>Товар по slug со всеми вложенностями, только чтение. Для страницы товара на витрине.</summary>
    Task<Product?> GetBySlugWithDetailsAsync(string slug, CancellationToken ct);

    /// <summary>Вариант вместе с товаром-владельцем, только чтение.</summary>
    Task<ProductVariant?> GetVariantAsync(Guid variantId, CancellationToken ct);

    /// <summary>Варианты по списку id вместе с товарами, только чтение. Отсутствующие id молча пропускаются.</summary>
    Task<IReadOnlyList<ProductVariant>> GetVariantsAsync(IReadOnlyCollection<Guid> variantIds, CancellationToken ct);

    Task<bool> SlugExistsAsync(string slug, Guid? exceptProductId, CancellationToken ct);

    /// <summary>Какие из переданных SKU уже заняты другими товарами.</summary>
    Task<IReadOnlyList<string>> TakenSkusAsync(IEnumerable<string> skus, Guid? exceptProductId, CancellationToken ct);

    Task<(IReadOnlyList<Product> Items, int Total)> SearchAsync(ProductFilter filter, CancellationToken ct);

    /// <summary>Поиск по витрине: только активные товары с хотя бы одним активным вариантом, только чтение.</summary>
    Task<(IReadOnlyList<Product> Items, int Total)> SearchPublicAsync(PublicProductFilter filter, CancellationToken ct);

    Task AddAsync(Product product, CancellationToken ct);
    void Remove(Product product);
    Task SaveChangesAsync(CancellationToken ct);
}
