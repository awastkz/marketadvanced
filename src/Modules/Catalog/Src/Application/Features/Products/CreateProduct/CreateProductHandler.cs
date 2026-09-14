using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Features.Products.CreateProduct;

public sealed class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductResult>
{
    private readonly IProductRepository _products;
    private readonly ICategoryRepository _categories;
    private readonly IBrandRepository _brands;
    private readonly IProductAttributeRepository _attributes;

    public CreateProductHandler(
        IProductRepository products,
        ICategoryRepository categories,
        IBrandRepository brands,
        IProductAttributeRepository attributes)
    {
        _products = products;
        _categories = categories;
        _brands = brands;
        _attributes = attributes;
    }

    public async Task<ProductResult> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        await ProductRules.EnsureValidAsync(
            null, request.Slug, request.CategoryId, request.BrandId, request.Variants, request.Attributes,
            _products, _categories, _brands, _attributes, cancellationToken);

        var product = new Product
        {
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            CategoryId = request.CategoryId,
            BrandId = request.BrandId,
            IsActive = request.IsActive,
            Attributes = request.Attributes
                .Select(a => new ProductAttributeValue { AttributeId = a.AttributeId, Value = a.Value })
                .ToList(),
            Variants = request.Variants
                .Select(v => new ProductVariant
                {
                    Sku = v.Sku,
                    Name = v.Name,
                    Price = v.Price,
                    Stock = v.Stock,
                    IsActive = v.IsActive,
                    Attributes = v.Attributes
                        .Select(a => new VariantAttributeValue { AttributeId = a.AttributeId, Value = a.Value })
                        .ToList(),
                })
                .ToList(),
        };

        await _products.AddAsync(product, cancellationToken);

        // у нового товара фото ещё нет, построитель URL не понадобится
        return ProductResult.From(product, path => path);
    }
}
