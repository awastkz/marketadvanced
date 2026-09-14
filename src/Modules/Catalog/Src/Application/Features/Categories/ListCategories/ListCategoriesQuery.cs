using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Categories.ListCategories;

public sealed record ListCategoriesQuery() : IRequest<IReadOnlyList<CategoryResult>>;
