using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Products.UpdateProduct;

public sealed record UpdateProductCommand(
    int Id,
    string Name,
    string Slug,
    string? Description,
    int CategoryId,
    int? BrandId,
    bool IsActive,
    IReadOnlyList<VariantInput> Variants,
    IReadOnlyList<AttributeValueInput> Attributes) : IRequest<ProductResult>;
