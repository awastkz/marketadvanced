using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;

namespace MarketAdvanced.Catalog.Application.Features.Categories.ListCategories;

public sealed class ListCategoriesHandler : IRequestHandler<ListCategoriesQuery, IReadOnlyList<CategoryResult>>
{
    private readonly ICategoryRepository _repo;

    public ListCategoriesHandler(ICategoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<CategoryResult>> Handle(ListCategoriesQuery request, CancellationToken cancellationToken)
    {
        var rows = await _repo.ListAsync(cancellationToken);
        return rows.Select(r => CategoryResult.From(r.Category, r.ProductsCount)).ToList();
    }
}
