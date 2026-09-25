using MediatR;
using MarketAdvanced.Catalog.Application.Common;
using MarketAdvanced.Catalog.Application.Common.Products;

namespace MarketAdvanced.Catalog.Application.Queries.Products.SearchProducts;

public sealed record SearchProductsQuery(
    string? Search,
    int? CategoryId,
    int? BrandId,
    bool? IsActive,
    int Page,
    int PageSize) : IRequest<Paged<ProductListItemResult>>;
