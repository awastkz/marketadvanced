using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Categories.GetCategory;

public sealed record GetCategoryQuery(int Id) : IRequest<CategoryResult>;
