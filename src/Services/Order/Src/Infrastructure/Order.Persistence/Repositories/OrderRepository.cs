using MarketAdvanced.Order.Application.Abstractions;
using MarketAdvanced.Order.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MarketAdvanced.Order.Persistence.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly OrderDbContext _db;

    public OrderRepository(OrderDbContext db)
    {
        _db = db;
    }

    public async Task<Orders?> FindByIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Order.Include(v => v.Items).FirstOrDefaultAsync(v => v.Id == id, ct);
    }

    public async Task AddAsync(Orders order, CancellationToken ct)
    {
        await _db.Order.AddAsync(order, ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }
}
