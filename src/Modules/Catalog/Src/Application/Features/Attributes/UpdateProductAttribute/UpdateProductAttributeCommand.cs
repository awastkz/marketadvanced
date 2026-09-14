using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Attributes.UpdateProductAttribute;

public sealed record UpdateProductAttributeCommand(int Id, string Name, string Slug, string? Unit, int SortOrder) : IRequest<ProductAttributeResult>;
