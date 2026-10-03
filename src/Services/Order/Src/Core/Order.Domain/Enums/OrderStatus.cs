namespace MarketAdvanced.Order.Domain;

public enum OrderStatus
{
    New = 1,
    Confirmed = 2,
    Processing = 3,
    Shipped = 4,
    Delivered = 5,
    Cancelled = 6,
}
