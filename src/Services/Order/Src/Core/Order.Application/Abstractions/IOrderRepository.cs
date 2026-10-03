using MarketAdvanced.Order.Domain.Entities;

namespace MarketAdvanced.Order.Application.Abstractions;

public interface IOrderRepository
{
    /// <summary>Заказ вместе с позициями. null, если заказа нет.</summary>
    Task<Orders?> FindByIdAsync(Guid id, CancellationToken ct);
    Task AddAsync(Orders order, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
