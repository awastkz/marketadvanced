namespace MarketAdvanced.Cart.Domain;

public class CartItem
{
    public int Id { get; set; }
      public int CartId { get; set; }
      public int VariantId { get; set; }
      public int Quantity { get; set; }
}