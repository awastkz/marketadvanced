using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Application.Common.Brands;

namespace MarketAdvanced.Catalog.Application.Queries.Brands.ListBrands;

public sealed class ListBrandsHandler : IRequestHandler<ListBrandsQuery, IReadOnlyList<BrandResult>>
{
    private readonly IBrandRepository _repo;

    public ListBrandsHandler(IBrandRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<BrandResult>> Handle(ListBrandsQuery request, CancellationToken cancellationToken)
    {
        var rows = await _repo.ListAsync(cancellationToken);
        return rows.Select(r => BrandResult.From(r.Brand, r.ProductsCount)).ToList();
    }
}
