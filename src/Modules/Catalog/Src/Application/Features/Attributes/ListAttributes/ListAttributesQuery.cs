using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Attributes.ListAttributes;

public sealed record ListAttributesQuery() : IRequest<IReadOnlyList<ProductAttributeResult>>;
