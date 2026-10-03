namespace MarketAdvanced.Order.Domain.Entities;

public class OrderItems
{
    public Guid Id {get; set;}
    public Guid OrderId {get; set;}
    public Guid VariantId {get; set;}
    public Guid ProductId {get; set;}
    public string ProductName {get; set;} = null!;
    public string? VariantName {get; set;}
    public string Sku {get; set;} = null!;
    public decimal Price {get; set;}
    public int Quantity {get; set;}

    public Orders Order {get; set;} = null!;
}
