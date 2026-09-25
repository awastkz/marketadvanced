using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Application.Exceptions;
using MarketAdvanced.Catalog.Domain;
using MarketAdvanced.Catalog.Application.Common.Products;

namespace MarketAdvanced.Catalog.Application.Commands.Products.UpdateProduct;

public sealed class UpdateProductHandler : IRequestHandler<UpdateProductCommand, ProductResult>
{
    private readonly IProductRepository _products;
    private readonly ICategoryRepository _categories;
    private readonly IBrandRepository _brands;
    private readonly IProductAttributeRepository _attributes;

    public UpdateProductHandler(
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

    public async Task<ProductResult> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _products.GetWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Товар не найден");

        await ProductRules.EnsureValidAsync(
            product.Id, request.Slug, request.CategoryId, request.BrandId, request.Variants, request.Attributes,
            _products, _categories, _brands, _attributes, cancellationToken);

        product.Name = request.Name;
        product.Slug = request.Slug;
        product.Description = request.Description;
        product.CategoryId = request.CategoryId;
        product.BrandId = request.BrandId;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        // характеристики товара: заменяем набор целиком
        product.Attributes.Clear();
        foreach (var a in request.Attributes)
            product.Attributes.Add(new ProductAttributeValue { AttributeId = a.AttributeId, Value = a.Value });

        SyncVariants(product, request.Variants);

        await _products.SaveChangesAsync(cancellationToken);

        // TODO: построитель URL фото появится вместе с S3-хранилищем
        return ProductResult.From(product, path => path);
    }

    /// <summary>Вариант с Id обновляется, без Id создаётся, отсутствующий в запросе удаляется.</summary>
    private static void SyncVariants(Product product, IReadOnlyList<VariantInput> inputs)
    {
        var keepIds = inputs.Where(v => v.Id is not null).Select(v => v.Id!.Value).ToHashSet();
        foreach (var stale in product.Variants.Where(v => !keepIds.Contains(v.Id)).ToList())
            product.Variants.Remove(stale);

        foreach (var input in inputs)
        {
            ProductVariant variant;
            if (input.Id is not null)
            {
                variant = product.Variants.FirstOrDefault(v => v.Id == input.Id)
                    ?? throw new NotFoundException($"Вариант {input.Id} не принадлежит этому товару");
                variant.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                variant = new ProductVariant();
                product.Variants.Add(variant);
            }

            variant.Sku = input.Sku;
            variant.Name = input.Name;
            variant.Price = input.Price;
            variant.Stock = input.Stock;
            variant.IsActive = input.IsActive;

            variant.Attributes.Clear();
            foreach (var a in input.Attributes)
                variant.Attributes.Add(new VariantAttributeValue { AttributeId = a.AttributeId, Value = a.Value });
        }
    }
}
