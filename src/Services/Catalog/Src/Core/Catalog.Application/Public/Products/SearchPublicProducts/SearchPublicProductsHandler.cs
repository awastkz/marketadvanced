using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Application.Common;
using MarketAdvanced.Catalog.Application.Common.Categories;

namespace MarketAdvanced.Catalog.Application.Public.Products.SearchPublicProducts;

public sealed class SearchPublicProductsHandler : IRequestHandler<SearchPublicProductsQuery, Paged<PublicProductCard>>
{
    private readonly IProductRepository _products;
    private readonly ICategoryRepository _categories;

    public SearchPublicProductsHandler(IProductRepository products, ICategoryRepository categories)
    {
        _products = products;
        _categories = categories;
    }

    public async Task<Paged<PublicProductCard>> Handle(SearchPublicProductsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyCollection<Guid>? categoryIds = null;
        if (request.CategoryId is not null)
        {
            var all = await _categories.ListAsync(cancellationToken);
            categoryIds = CategoryTree.DescendantIds(all.Select(r => r.Category), request.CategoryId.Value);
        }

        var filter = new PublicProductFilter(
            request.Search?.Trim(), categoryIds, request.BrandId, request.Sort, request.Page, request.PageSize);
        var (items, total) = await _products.SearchPublicAsync(filter, cancellationToken);

        // TODO: построитель URL фото появится вместе с S3-хранилищем
        return new Paged<PublicProductCard>(items.Select(p => PublicProductCard.From(p, path => path)).ToList(), total);
    }
}
