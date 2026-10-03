using MarketAdvanced.Order.Application.Common;
using MediatR;

namespace MarketAdvanced.Order.Application.Commands.Orders.CreateOrder;

public sealed record CreateOrderCommand(
    Guid? UserId,
    Guid? GuestId,
    IReadOnlyList<CreateOrderItem> Items) : IRequest<OrderResult>;

public sealed record CreateOrderItem(Guid VariantId, int Quantity);
