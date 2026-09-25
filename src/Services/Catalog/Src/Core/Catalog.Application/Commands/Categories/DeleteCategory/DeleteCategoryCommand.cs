using MediatR;

namespace MarketAdvanced.Catalog.Application.Commands.Categories.DeleteCategory;

public sealed record DeleteCategoryCommand(int Id) : IRequest;
