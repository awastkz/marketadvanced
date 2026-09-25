using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Application.Exceptions;
using MarketAdvanced.Catalog.Application.Common.Brands;

namespace MarketAdvanced.Catalog.Application.Queries.Brands.GetBrand;

public sealed class GetBrandHandler : IRequestHandler<GetBrandQuery, BrandResult>
{
    private readonly IBrandRepository _repo;

    public GetBrandHandler(IBrandRepository repo)
    {
        _repo = repo;
    }

    public async Task<BrandResult> Handle(GetBrandQuery request, CancellationToken cancellationToken)
    {
        var brand = await _repo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Бренд не найден");
        return BrandResult.From(brand, await _repo.ProductsCountAsync(brand.Id, cancellationToken));
    }
}
