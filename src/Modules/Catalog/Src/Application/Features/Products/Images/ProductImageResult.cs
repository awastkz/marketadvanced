namespace MarketAdvanced.Catalog.Application.Features.Products.Images;

public sealed record ProductImageResult(int Id, string Url, string? Alt, int SortOrder, bool IsMain);
