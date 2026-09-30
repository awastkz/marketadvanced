namespace MarketAdvanced.Cart.Domain;

public class CartItem
{
    public Guid Id { get; set; }
      public Guid CartId { get; set; }
      public Guid VariantId { get; set; }
      public int Quantity { get; set; }
}