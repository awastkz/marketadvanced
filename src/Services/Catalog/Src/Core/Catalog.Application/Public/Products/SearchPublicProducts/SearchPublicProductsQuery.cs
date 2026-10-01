using MediatR;
using MarketAdvanced.Catalog.Application.Common;

namespace MarketAdvanced.Catalog.Application.Public.Products.SearchPublicProducts;

/// <summary>Поиск по витрине: только активные товары с хотя бы одним активным вариантом.</summary>
public sealed record SearchPublicProductsQuery(
    string? Search,
    Guid? CategoryId,
    Guid? BrandId,
    PublicProductSort Sort,
    int Page,
    int PageSize) : IRequest<Paged<PublicProductCard>>;
