using MediatR;

namespace MarketAdvanced.Catalog.Application.Commands.Products.DeleteProduct;

public sealed record DeleteProductCommand(Guid Id) : IRequest;
