using MediatR;
using MarketAdvanced.Catalog.Application.Common;

namespace MarketAdvanced.Catalog.Application.Features.Products.SearchProducts;

public sealed record SearchProductsQuery(
    string? Search,
    int? CategoryId,
    int? BrandId,
    bool? IsActive,
    int Page,
    int PageSize) : IRequest<Paged<ProductListItemResult>>;
