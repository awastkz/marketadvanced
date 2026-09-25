using MediatR;
using MarketAdvanced.Catalog.Application.Common.Categories;

namespace MarketAdvanced.Catalog.Application.Queries.Categories.ListCategories;

public sealed record ListCategoriesQuery() : IRequest<IReadOnlyList<CategoryResult>>;
