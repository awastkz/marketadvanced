namespace MarketAdvanced.Cart.Domain;

public class ShoppingCart
{
    public int Id {get; set;}
    public int? UserId {get;set;}
    public Guid? GuestId {get;set;}
    public DateTime UpdatedAt {get;set;}
    public DateTime? ExpiresAt {get;set;}
    public ICollection<CartItem> Items {get;set;} = new List<CartItem>();

    public static ShoppingCart Create(CartOwner owner) => new()
    {
        UserId = owner.UserId,
        GuestId = owner.GuestId,
        ExpiresAt = owner.GuestId is not null ? DateTime.UtcNow.AddDays(30) : null,
    };

    public void AddItem(int variantId, int quantity)
    {
        var item = Items.FirstOrDefault(v => v.VariantId == variantId);
        if(item is null)
        Items.Add(new CartItem {VariantId = variantId, Quantity = quantity});
        else
        item.Quantity += quantity;
        UpdatedAt = DateTime.UtcNow;
    }
    public void RemoveItem(int variantId)
    {
        var item = Items.FirstOrDefault(v => v.VariantId == variantId);
        if(item is null) return;
        Items.Remove(item);
        UpdatedAt = DateTime.UtcNow;
    }

    public void Clear()
    {
        Items.Clear();
        UpdatedAt = DateTime.UtcNow;
    }
}