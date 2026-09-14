namespace MarketAdvanced.Catalog.Application.Common;

public sealed record Paged<T>(IReadOnlyList<T> Items, int Total);
