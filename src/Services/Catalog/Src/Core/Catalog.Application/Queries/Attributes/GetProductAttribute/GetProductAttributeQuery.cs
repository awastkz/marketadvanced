using MediatR;
using MarketAdvanced.Catalog.Application.Common.Attributes;

namespace MarketAdvanced.Catalog.Application.Queries.Attributes.GetProductAttribute;

public sealed record GetProductAttributeQuery(int Id) : IRequest<ProductAttributeResult>;
