namespace MarketAdvanced.Cart.Application.Common.Cart;

public sealed record CartResult(Guid Id, IReadOnlyList<CartItemResult> Items, decimal Total)
{
    public static CartResult Empty => new(Guid.Empty, [], 0);
}
