using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Categories.DeleteCategory;

public sealed record DeleteCategoryCommand(int Id) : IRequest;
