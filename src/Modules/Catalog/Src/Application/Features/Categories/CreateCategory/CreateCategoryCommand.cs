using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Categories.CreateCategory;

public sealed record CreateCategoryCommand(int UserId, string Name, string Slug, int SortOrder, int? ParentId) : IRequest<CategoryResult>;
