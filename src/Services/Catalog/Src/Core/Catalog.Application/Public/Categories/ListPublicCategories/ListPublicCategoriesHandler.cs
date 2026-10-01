using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;

namespace MarketAdvanced.Catalog.Application.Public.Categories.ListPublicCategories;

public sealed class ListPublicCategoriesHandler : IRequestHandler<ListPublicCategoriesQuery, IReadOnlyList<PublicCategory>>
{
    private readonly ICategoryRepository _categories;

    public ListPublicCategoriesHandler(ICategoryRepository categories)
    {
        _categories = categories;
    }

    public async Task<IReadOnlyList<PublicCategory>> Handle(ListPublicCategoriesQuery request, CancellationToken cancellationToken)
    {
        var rows = await _categories.ListAsync(cancellationToken);
        return rows.Select(r => PublicCategory.From(r.Category)).ToList();
    }
}
