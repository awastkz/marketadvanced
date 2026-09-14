using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Attributes.CreateProductAttribute;

public sealed record CreateProductAttributeCommand(string Name, string Slug, string? Unit, int SortOrder) : IRequest<ProductAttributeResult>;
