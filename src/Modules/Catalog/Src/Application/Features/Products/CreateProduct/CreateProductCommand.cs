using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Products.CreateProduct;

public sealed record CreateProductCommand(
    string Name,
    string Slug,
    string? Description,
    int CategoryId,
    int? BrandId,
    bool IsActive,
    IReadOnlyList<VariantInput> Variants,
    IReadOnlyList<AttributeValueInput> Attributes) : IRequest<ProductResult>;
