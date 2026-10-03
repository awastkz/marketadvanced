using MarketAdvanced.Order.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MarketAdvanced.Order.Persistence;

public class OrderDbContext : DbContext
{
    public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options) {}
    public DbSet<Orders> Order => Set<Orders>();
    public DbSet<OrderItems> OrderItem => Set<OrderItems>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("order");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderDbContext).Assembly);
    }
}
