using MarketAdvanced.Cart.Application.Abstractions;
using MarketAdvanced.Cart.Domain;
using MediatR;

namespace MarketAdvanced.Cart.Application.Features.Cart.ClearItems;

public sealed class ClearItemsHandler : IRequestHandler<ClearItemsCommand>
{
    private readonly ICartRepository _repo;

    public ClearItemsHandler(ICartRepository repo)
    {
        _repo = repo;
    }

    public Task Handle(ClearItemsCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
