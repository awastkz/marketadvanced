using MarketAdvanced.Order.Domain;

namespace MarketAdvanced.Order.Application.Common;

public sealed record OrderResult(
    Guid Id,
    long Number,
    OrderStatus Status,
    IReadOnlyList<OrderItemResult> Items,
    decimal Total,
    DateTime CreatedAt);

public sealed record OrderItemResult(
    Guid Id,
    Guid VariantId,
    Guid ProductId,
    string ProductName,
    string? VariantName,
    string Sku,
    decimal Price,
    int Quantity);
