using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Application.Exceptions;
using MarketAdvanced.Catalog.Application.Common.Categories;

namespace MarketAdvanced.Catalog.Application.Queries.Categories.GetCategory;

public sealed class GetCategoryHandler : IRequestHandler<GetCategoryQuery, CategoryResult>
{
    private readonly ICategoryRepository _repo;

    public GetCategoryHandler(ICategoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<CategoryResult> Handle(GetCategoryQuery request, CancellationToken cancellationToken)
    {
        var category = await _repo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Категория не найдена");
        return CategoryResult.From(category, await _repo.ProductsCountAsync(category.Id, cancellationToken));
    }
}
