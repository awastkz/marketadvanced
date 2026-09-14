using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Products.DeleteProduct;

public sealed record DeleteProductCommand(int Id) : IRequest;
