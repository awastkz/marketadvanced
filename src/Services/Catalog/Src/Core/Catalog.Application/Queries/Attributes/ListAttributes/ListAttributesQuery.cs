using MediatR;
using MarketAdvanced.Catalog.Application.Common.Attributes;

namespace MarketAdvanced.Catalog.Application.Queries.Attributes.ListAttributes;

public sealed record ListAttributesQuery() : IRequest<IReadOnlyList<ProductAttributeResult>>;
