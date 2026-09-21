using MarketAdvanced.Cart.Domain;
namespace MarketAdvanced.Cart.Application.Abstractions;

public interface ICartRepository
{
    Task<ShoppingCart?> FindByOwner(CartOwner owner, CancellationToken ct);
    Task Add(ShoppingCart cart, CancellationToken ct);
    Task Save(CancellationToken ct);
}