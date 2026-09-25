using MediatR;
using MarketAdvanced.Catalog.Application.Common.Products;

namespace MarketAdvanced.Catalog.Application.Queries.Products.GetProduct;

public sealed record GetProductQuery(int Id) : IRequest<ProductResult>;
