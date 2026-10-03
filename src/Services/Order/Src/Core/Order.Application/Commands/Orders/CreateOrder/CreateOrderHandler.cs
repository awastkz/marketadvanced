using System.Data.Common;
using MarketAdvanced.Order.Application.Abstractions;
using MarketAdvanced.Order.Application.Common;
using MarketAdvanced.Order.Application.Services.Catalog;
using MarketAdvanced.Order.Domain;
using MediatR;

namespace MarketAdvanced.Order.Application.Commands.Orders.CreateOrder;

public sealed class CreateOrderHandler(IOrderRepository repo, ICatalogClient catalog) : IRequestHandler<CreateOrderCommand, OrderResult>
{
    public async Task<OrderResult> Handle(CreateOrderCommand request, CancellationToken ct)
    {
        var variantIds = request.Items.Select(v => v.VariantId).ToList();
        var variants = await catalog.GetVariantsAsync(variantIds, ct);
    }
}
