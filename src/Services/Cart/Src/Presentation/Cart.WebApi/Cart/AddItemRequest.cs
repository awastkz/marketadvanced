namespace MarketAdvanced.Cart.WebApi.Cart;

/// <summary>Тело POST api/cart/items. Остальные эндпоинты берут variantId из маршрута.</summary>
public sealed record AddItemRequest(Guid VariantId, int Quantity);
