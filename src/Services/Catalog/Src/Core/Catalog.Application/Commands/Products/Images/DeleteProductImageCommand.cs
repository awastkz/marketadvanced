using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;

namespace MarketAdvanced.Catalog.Application.Commands.Products.Images;

public sealed record DeleteProductImageCommand(Guid ProductId, Guid ImageId) : IRequest;

public sealed class DeleteProductImageHandler : IRequestHandler<DeleteProductImageCommand>
{
    private readonly IProductRepository _repo;

    public DeleteProductImageHandler(IProductRepository repo)
    {
        _repo = repo;
    }

    public Task Handle(DeleteProductImageCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
