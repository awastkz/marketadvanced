using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Domain;
using MarketAdvanced.Catalog.Application.Common.Products;
using MarketAdvanced.Catalog.Application.IntegrationEvents;
using MarketAdvanced.Shared.Application.Messaging;

namespace MarketAdvanced.Catalog.Application.Commands.Products.CreateProduct;

public sealed class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductResult>
{
    private readonly IProductRepository _products;
    private readonly ICategoryRepository _categories;
    private readonly IBrandRepository _brands;
    private readonly IProductAttributeRepository _attributes;
    private readonly IEventPublisher _publisher;

    public CreateProductHandler(
        IProductRepository products,
        ICategoryRepository categories,
        IBrandRepository brands,
        IProductAttributeRepository attributes,
        IEventPublisher publisher)
    {
        _products = products;
        _categories = categories;
        _brands = brands;
        _attributes = attributes;
        _publisher = publisher;
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
            UserId = request.UserId,
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

        // Guid-ключ EF генерирует на клиенте уже здесь, до сохранения
        await _products.AddAsync(product, cancellationToken);

        // с outbox (прод) событие пишется в OutboxMessage и сохраняется одной транзакцией с товаром в SaveChanges ниже.
        // Без outbox (dev, все сервисы в одном процессе) уходит в RabbitMQ сразу
        await _publisher.PublishAsync(new ProductCreatedV1
        {
            EventId = Guid.NewGuid(),
            OccurredAt = product.CreatedAt,
            ProductId = product.Id,
            Name = product.Name,
            Slug = product.Slug,
            CategoryId = product.CategoryId,
            BrandId = product.BrandId,
            IsActive = product.IsActive,
            Variants = product.Variants
                .Select(v => new ProductVariantV1
                {
                    VariantId = v.Id,
                    Sku = v.Sku,
                    Name = v.Name,
                    Price = (long)(v.Price * 100),
                    IsActive = v.IsActive,
                })
                .ToList(),
        }, cancellationToken);

        await _products.SaveChangesAsync(cancellationToken);

        // у нового товара фото ещё нет, построитель URL не понадобится
        return ProductResult.From(product, path => path);
    }
}
