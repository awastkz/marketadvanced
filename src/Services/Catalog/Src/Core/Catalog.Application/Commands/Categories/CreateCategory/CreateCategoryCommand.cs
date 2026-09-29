using MediatR;
using MarketAdvanced.Catalog.Application.Common.Categories;

namespace MarketAdvanced.Catalog.Application.Commands.Categories.CreateCategory;

public sealed record CreateCategoryCommand(Guid UserId, string Name, string Slug, int SortOrder, int? ParentId) : IRequest<CategoryResult>;
