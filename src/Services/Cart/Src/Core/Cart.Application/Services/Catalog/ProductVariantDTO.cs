namespace MarketAdvanced.Cart.Application.Services.Catalog;

/// <summary>Копия ответа Catalog GET api/internal/variants. Только поля, нужные корзине.</summary>
public sealed record ProductVariantDTO(Guid Id, string ProductName, string Sku, string? Name, decimal Price, bool IsActive);
