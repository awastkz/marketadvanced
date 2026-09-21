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
}