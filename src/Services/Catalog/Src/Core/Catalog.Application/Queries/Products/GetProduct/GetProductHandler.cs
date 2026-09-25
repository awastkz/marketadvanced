using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Application.Exceptions;
using MarketAdvanced.Catalog.Application.Common.Products;

namespace MarketAdvanced.Catalog.Application.Queries.Products.GetProduct;

public sealed class GetProductHandler : IRequestHandler<GetProductQuery, ProductResult>
{
    private readonly IProductRepository _repo;

    public GetProductHandler(IProductRepository repo)
    {
        _repo = repo;
    }

    public async Task<ProductResult> Handle(GetProductQuery request, CancellationToken cancellationToken)
    {
        var product = await _repo.GetWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Товар не найден");

        // TODO: построитель URL фото появится вместе с S3-хранилищем
        return ProductResult.From(product, path => path);
    }
}
