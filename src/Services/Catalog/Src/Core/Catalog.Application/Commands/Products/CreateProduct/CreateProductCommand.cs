using MediatR;
using MarketAdvanced.Catalog.Application.Common.Products;

namespace MarketAdvanced.Catalog.Application.Commands.Products.CreateProduct;

public sealed record CreateProductCommand(
    Guid UserId,
    string Name,
    string Slug,
    string? Description,
    int CategoryId,
    int? BrandId,
    bool IsActive,
    IReadOnlyList<VariantInput> Variants,
    IReadOnlyList<AttributeValueInput> Attributes) : IRequest<ProductResult>, IProductInput;
