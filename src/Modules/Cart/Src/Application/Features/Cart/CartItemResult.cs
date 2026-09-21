using MarketAdvanced.Cart.Application.Services.Catalog;
using MarketAdvanced.Cart.Domain;
namespace MarketAdvanced.Cart.Application.Features.Cart;

public sealed record CartItemResult(
    int Id,
    int VariantId,
    string ProductName,
    string Sku,
    decimal Price,
    int Quantity,
    decimal LineTotal)
{
    public static CartItemResult From(CartItem i, ProductVariantDTO v) =>
        new(i.Id, i.VariantId, v.ProductName, v.Sku, v.Price, i.Quantity, v.Price * i.Quantity);
}
