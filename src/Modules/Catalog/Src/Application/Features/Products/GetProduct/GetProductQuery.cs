using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Products.GetProduct;

public sealed record GetProductQuery(int Id) : IRequest<ProductResult>;
