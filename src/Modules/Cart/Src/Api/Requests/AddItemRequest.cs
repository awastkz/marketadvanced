namespace MarketAdvanced.Cart.Api.Requests;

/// <summary>Тело POST api/cart/items. Остальные эндпоинты берут variantId из маршрута.</summary>
public sealed record AddItemRequest(int VariantId, int Quantity);
