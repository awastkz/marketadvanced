using MarketAdvanced.Cart.Application.Services.Catalog;
using MarketAdvanced.Cart.Application.Abstractions;
using MarketAdvanced.Cart.Domain;
using MediatR;
using MarketAdvanced.Shared.Application.Exceptions;

namespace MarketAdvanced.Cart.Application.Commands.Cart.AddItem;

public sealed class AddItemHandler : IRequestHandler<AddItemCommand>
{
    private readonly ICartRepository _repo;
    private readonly ICatalogClient _catalog;

    public AddItemHandler(ICartRepository repo, ICatalogClient catalog)
    {
        _repo = repo;
        _catalog = catalog;
    }

    public async Task Handle(AddItemCommand request, CancellationToken ct)
    {

        var productVariant = await _catalog.GetVariantAsync(request.VariantId, ct);
        if(productVariant is null || !productVariant.IsActive)
        throw new NotFoundException("Вариант не найден или снят с продажи");

        var cart = await _repo.FindByOwner(request.Owner, ct);

        if(cart is null)
        {
            cart = ShoppingCart.Create(request.Owner);
            await _repo.Add(cart, ct);
        }

        cart.AddItem(request.VariantId, request.Quantity);

        await _repo.Save(ct);
    }
}
