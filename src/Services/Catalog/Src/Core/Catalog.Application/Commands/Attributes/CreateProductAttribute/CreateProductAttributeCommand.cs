using MediatR;
using MarketAdvanced.Catalog.Application.Common.Attributes;

namespace MarketAdvanced.Catalog.Application.Commands.Attributes.CreateProductAttribute;

public sealed record CreateProductAttributeCommand(int UserId, string Name, string Slug, string? Unit, int SortOrder) : IRequest<ProductAttributeResult>;
