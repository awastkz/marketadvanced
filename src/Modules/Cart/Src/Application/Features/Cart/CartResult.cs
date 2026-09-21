namespace MarketAdvanced.Cart.Application.Features.Cart;

public sealed record CartResult(int Id, IReadOnlyList<CartItemResult> Items, decimal Total)
{
    public static CartResult Empty => new(0, [], 0);
}
