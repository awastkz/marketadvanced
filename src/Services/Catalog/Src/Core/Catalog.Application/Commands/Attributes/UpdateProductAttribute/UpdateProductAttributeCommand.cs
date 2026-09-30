using MediatR;
using MarketAdvanced.Catalog.Application.Common.Attributes;

namespace MarketAdvanced.Catalog.Application.Commands.Attributes.UpdateProductAttribute;

public sealed record UpdateProductAttributeCommand(Guid Id, string Name, string Slug, string? Unit, int SortOrder) : IRequest<ProductAttributeResult>;
