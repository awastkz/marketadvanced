namespace MarketAdvanced.Order.WebApi.Public.Controllers;

/// <summary>Тело POST api/orders.</summary>
public sealed record CreateOrderRequest(IReadOnlyList<CreateOrderItemRequest> Items);

public sealed record CreateOrderItemRequest(Guid VariantId, int Quantity);
