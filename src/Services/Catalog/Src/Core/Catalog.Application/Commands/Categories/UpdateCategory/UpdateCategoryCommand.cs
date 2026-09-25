using MediatR;
using MarketAdvanced.Catalog.Application.Common.Categories;

namespace MarketAdvanced.Catalog.Application.Commands.Categories.UpdateCategory;

public sealed record UpdateCategoryCommand(int Id, string Name, string Slug, int SortOrder, int? ParentId) : IRequest<CategoryResult>;
