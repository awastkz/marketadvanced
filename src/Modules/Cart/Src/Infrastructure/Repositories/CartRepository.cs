using MarketAdvanced.Cart.Application.Abstractions;
using MarketAdvanced.Cart.Domain;
using MarketAdvanced.Cart.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace MarketAdvanced.Cart.Infrastructure.Repositories;


public class CartRepository : ICartRepository
{
    private readonly CartDbContext _db;

    public CartRepository(CartDbContext db)
    {
        _db = db;
    }

    public async Task Add(ShoppingCart cart, CancellationToken ct)
    {
        await _db.Cart.AddAsync(cart);
    }

    public async Task RemoveItemsAsync(CartOwner owner, CancellationToken ct)
    {
        var cart = await _db.Cart.FirstOrDefaultAsync(v => owner.isGuest
        ? v.GuestId == owner.GuestId
        : v.UserId == owner.UserId, ct);
        if(cart is null) return;
        await _db.CartItem.Where(v => v.CartId == cart.Id).ExecuteDeleteAsync();
    }

    public async Task<ShoppingCart?> FindByOwner(CartOwner owner, CancellationToken ct)
    {
        return await _db.Cart.Include(v => v.Items).FirstOrDefaultAsync(v => owner.isGuest
        ? v.GuestId == owner.GuestId
        : v.UserId == owner.UserId, ct);
    }

    public async Task Save(CancellationToken ct)
    {
        await _db.SaveChangesAsync();
    }
    public async Task RemoveItemAsync(CartOwner owner, int variantId, CancellationToken ct)
    {
        var cart = await this.FindByOwner(owner, ct);
        if(cart is null) return;
        await _db.CartItem.Where(v => v.CartId == cart.Id && v.VariantId == variantId).ExecuteDeleteAsync(ct);

    }
}