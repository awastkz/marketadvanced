using MarketAdvanced.Cart.Application.Abstractions;
using MarketAdvanced.Cart.Domain;
using MediatR;

namespace MarketAdvanced.Cart.Application.Features.Cart.RemoveItem;

public sealed class RemoveItemHandler : IRequestHandler<RemoveItemCommand>
{
    private readonly ICartRepository _repo;

    public RemoveItemHandler(ICartRepository repo)
    {
        _repo = repo;
    }

    public Task Handle(RemoveItemCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
