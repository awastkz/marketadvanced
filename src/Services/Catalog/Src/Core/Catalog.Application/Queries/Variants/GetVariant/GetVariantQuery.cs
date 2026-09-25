using MediatR;
using MarketAdvanced.Catalog.Application.Common.Variants;

namespace MarketAdvanced.Catalog.Application.Queries.Variants.GetVariant;

public sealed record GetVariantQuery(int Id) : IRequest<VariantDetailsResult>;
