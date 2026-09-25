using MediatR;
using MarketAdvanced.Catalog.Application.Common.Categories;

namespace MarketAdvanced.Catalog.Application.Queries.Categories.GetCategory;

public sealed record GetCategoryQuery(int Id) : IRequest<CategoryResult>;
