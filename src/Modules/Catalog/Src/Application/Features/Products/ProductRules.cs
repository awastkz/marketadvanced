using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Exceptions;

namespace MarketAdvanced.Catalog.Application.Features.Products;

/// <summary>Проверки, которым нужна база: существование связанных сущностей и уникальность.</summary>
internal static class ProductRules
{
    public static async Task EnsureValidAsync(
        int? productId,
        string slug,
        int categoryId,
        int? brandId,
        IReadOnlyList<VariantInput> variants,
        IReadOnlyList<AttributeValueInput> attributes,
        IProductRepository products,
        ICategoryRepository categories,
        IBrandRepository brands,
        IProductAttributeRepository attributeRepo,
        CancellationToken ct)
    {
        if (!await categories.ExistsAsync(categoryId, ct))
            throw new NotFoundException("Категория не найдена");

        if (brandId is not null && !await brands.ExistsAsync(brandId.Value, ct))
            throw new NotFoundException("Бренд не найден");

        if (await products.SlugExistsAsync(slug, productId, ct))
            throw new ConflictException($"Slug «{slug}» уже занят");

        var taken = await products.TakenSkusAsync(variants.Select(v => v.Sku), productId, ct);
        if (taken.Count > 0)
            throw new ConflictException($"SKU уже используется: {string.Join(", ", taken)}");

        var wanted = attributes.Select(a => a.AttributeId)
            .Concat(variants.SelectMany(v => v.Attributes).Select(a => a.AttributeId))
            .Distinct()
            .ToList();
        if (wanted.Count > 0)
        {
            var existing = await attributeRepo.ExistingIdsAsync(wanted, ct);
            var missing = wanted.Except(existing).ToList();
            if (missing.Count > 0)
                throw new NotFoundException($"Атрибуты не найдены: {string.Join(", ", missing)}");
        }
    }
}
