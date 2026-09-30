namespace MarketAdvanced.Catalog.Application.Commands.Products.Images;

public sealed record ProductImageResult(Guid Id, string Url, string? Alt, int SortOrder, bool IsMain);
