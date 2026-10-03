using MarketAdvanced.Order.Application.Abstractions;
using MarketAdvanced.Order.Application.Common;
using MediatR;

namespace MarketAdvanced.Order.Application.Queries.Orders.GetOrder;

public sealed class GetOrderHandler : IRequestHandler<GetOrderQuery, OrderResult>
{
    private readonly IOrderRepository _repo;

    public GetOrderHandler(IOrderRepository repo)
    {
        _repo = repo;
    }

    public Task<OrderResult> Handle(GetOrderQuery request, CancellationToken ct)
    {
        throw new NotImplementedException();
    }
}
