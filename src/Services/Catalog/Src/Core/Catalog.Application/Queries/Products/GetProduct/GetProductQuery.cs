using MediatR;
using MarketAdvanced.Catalog.Application.Common.Products;

namespace MarketAdvanced.Catalog.Application.Queries.Products.GetProduct;

public sealed record GetProductQuery(Guid Id) : IRequest<ProductResult>;
