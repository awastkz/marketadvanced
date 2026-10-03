using MarketAdvanced.Order.Application.Common;
using MediatR;

namespace MarketAdvanced.Order.Application.Queries.Orders.GetOrder;

public sealed record GetOrderQuery(Guid Id, Guid? UserId, Guid? GuestId) : IRequest<OrderResult>;
