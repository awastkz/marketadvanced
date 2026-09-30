using MediatR;
using MarketAdvanced.Catalog.Application.Common.Products;

namespace MarketAdvanced.Catalog.Application.Commands.Products.CreateProduct;

public sealed record CreateProductCommand(
    Guid UserId,
    string Name,
    string Slug,
    string? Description,
    Guid CategoryId,
    Guid? BrandId,
    bool IsActive,
    IReadOnlyList<VariantInput> Variants,
    IReadOnlyList<AttributeValueInput> Attributes) : IRequest<ProductResult>, IProductInput;
