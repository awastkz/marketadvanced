namespace MarketAdvanced.Order.Application.Services.Catalog;

public sealed record ProductVariantDTO(Guid ProductId,
string ProductName,
Guid Id,
string? Name,
string Sku,
decimal Price,
int Stock,
bool IsActive
);
