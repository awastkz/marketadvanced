using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Variants.GetVariant;

public sealed record GetVariantQuery(int Id) : IRequest<VariantDetailsResult>;
