using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Application.Exceptions;

namespace MarketAdvanced.Catalog.Application.Public.Products.GetPublicProduct;

public sealed class GetPublicProductHandler : IRequestHandler<GetPublicProductQuery, PublicProductDetails>
{
    private readonly IProductRepository _products;

    public GetPublicProductHandler(IProductRepository products)
    {
        _products = products;
    }

    public async Task<PublicProductDetails> Handle(GetPublicProductQuery request, CancellationToken cancellationToken)
    {
        var product = await _products.GetBySlugWithDetailsAsync(request.Slug, cancellationToken);

        // неактивный товар или товар без активных вариантов для покупателя не существует
        if (product is null || !product.IsActive || !product.Variants.Any(v => v.IsActive))
            throw new NotFoundException("Товар не найден");

        // TODO: построитель URL фото появится вместе с S3-хранилищем
        return PublicProductDetails.From(product, path => path);
    }
}
