using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Attributes.GetProductAttribute;

public sealed record GetProductAttributeQuery(int Id) : IRequest<ProductAttributeResult>;
