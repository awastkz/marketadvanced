using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Categories.UpdateCategory;

public sealed record UpdateCategoryCommand(int Id, string Name, string Slug, int SortOrder, int? ParentId) : IRequest<CategoryResult>;
