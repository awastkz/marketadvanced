using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Application.Common;
using MarketAdvanced.Catalog.Application.Common.Products;

namespace MarketAdvanced.Catalog.Application.Queries.Products.SearchProducts;

public sealed class SearchProductsHandler : IRequestHandler<SearchProductsQuery, Paged<ProductListItemResult>>
{
    private readonly IProductRepository _products;
    private readonly ICategoryRepository _categories;

    public SearchProductsHandler(IProductRepository products, ICategoryRepository categories)
    {
        _products = products;
        _categories = categories;
    }

    public async Task<Paged<ProductListItemResult>> Handle(SearchProductsQuery request, CancellationToken cancellationToken)
    {
        // фильтр по категории включает все её подкатегории
        IReadOnlyCollection<int>? categoryIds = null;
        if (request.CategoryId is not null)
            categoryIds = await DescendantIdsAsync(request.CategoryId.Value, cancellationToken);

        var filter = new ProductFilter(request.Search, categoryIds, request.BrandId, request.IsActive, request.Page, request.PageSize);
        var (items, total) = await _products.SearchAsync(filter, cancellationToken);

        // TODO: построитель URL фото появится вместе с S3-хранилищем
        return new Paged<ProductListItemResult>(items.Select(p => ProductListItemResult.From(p, path => path)).ToList(), total);
    }

    private async Task<IReadOnlyCollection<int>> DescendantIdsAsync(int rootId, CancellationToken ct)
    {
        var all = await _categories.ListAsync(ct);
        var ids = new HashSet<int> { rootId };
        var grew = true;
        while (grew)
        {
            grew = false;
            foreach (var (c, _) in all)
            {
                if (c.ParentId is not null && ids.Contains(c.ParentId.Value) && ids.Add(c.Id)) grew = true;
            }
        }
        return ids;
    }
}
