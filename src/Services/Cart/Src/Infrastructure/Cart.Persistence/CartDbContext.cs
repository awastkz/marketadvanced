using MarketAdvanced.Cart.Domain;
using Microsoft.EntityFrameworkCore;

namespace MarketAdvanced.Cart.Persistence;

public class CartDbContext : DbContext
{
    public CartDbContext(DbContextOptions<CartDbContext> options) : base(options) {}
    public DbSet<ShoppingCart> Cart => Set<ShoppingCart>();
    public DbSet<CartItem> CartItem => Set<CartItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("cart");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CartDbContext).Assembly);
    }
}
