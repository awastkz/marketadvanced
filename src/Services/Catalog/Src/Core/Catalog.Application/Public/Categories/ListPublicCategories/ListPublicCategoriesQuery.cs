using MediatR;

namespace MarketAdvanced.Catalog.Application.Public.Categories.ListPublicCategories;

public sealed record ListPublicCategoriesQuery : IRequest<IReadOnlyList<PublicCategory>>;
