using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;

namespace MarketAdvanced.Catalog.Application.Commands.Products.Images;

public sealed record SetMainProductImageCommand(int ProductId, int ImageId) : IRequest;

public sealed class SetMainProductImageHandler : IRequestHandler<SetMainProductImageCommand>
{
    private readonly IProductRepository _repo;

    public SetMainProductImageHandler(IProductRepository repo)
    {
        _repo = repo;
    }

    public Task Handle(SetMainProductImageCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
