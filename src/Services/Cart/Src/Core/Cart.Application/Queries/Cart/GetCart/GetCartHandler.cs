using MarketAdvanced.Cart.Application.Services.Catalog;
using MarketAdvanced.Cart.Application.Abstractions;
using MarketAdvanced.Cart.Domain;
using MediatR;
using MarketAdvanced.Cart.Application.Common.Cart;

namespace MarketAdvanced.Cart.Application.Queries.Cart.GetCart;

public sealed class GetCartHandler : IRequestHandler<GetCartQuery, CartResult>
{
    private readonly ICartRepository _repo;
    private readonly ICatalogClient _catalog;

    public GetCartHandler(ICartRepository repo, ICatalogClient catalog)
    {
        _repo = repo;
        _catalog = catalog;
    }

    public async Task<CartResult> Handle(GetCartQuery request, CancellationToken ct)
    {
        var cart = await _repo.FindByOwner(request.Owner, ct);
        if (cart is null || cart.Items.Count == 0)
            return cart is null ? CartResult.Empty : new CartResult(cart.Id, [], 0);

        var ids = cart.Items.Select(i => i.VariantId).ToList();
        var variants = await _catalog.GetVariantsAsync(ids, ct);
        var byId = variants.ToDictionary(v => v.Id);

        // позиции, которых Catalog больше не знает, не показываем; чистить их — задача события об удалении варианта
        var items = cart.Items
            .Where(i => byId.ContainsKey(i.VariantId))
            .Select(i => CartItemResult.From(i, byId[i.VariantId]))
            .ToList();

        return new CartResult(cart.Id, items, items.Sum(x => x.LineTotal));
    }
}
