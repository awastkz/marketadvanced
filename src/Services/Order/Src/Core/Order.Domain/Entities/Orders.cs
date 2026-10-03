namespace MarketAdvanced.Order.Domain.Entities;

public class Orders
{
    public Guid Id {get;set;}
    public long Number {get;set;}
    public Guid? UserId {get;set;}
    public Guid? GuestId {get;set;}
    public OrderStatus Status {get;set;} = OrderStatus.New;

    public ICollection<OrderItems> Items {get;set;} = new List<OrderItems>();
    public decimal Total {get;set;}
    public DateTime CreatedAt {get;set;} = DateTime.UtcNow;
    public DateTime? UpdatedAt {get;set;}
}
