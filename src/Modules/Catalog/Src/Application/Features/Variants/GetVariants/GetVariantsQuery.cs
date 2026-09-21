using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Variants.GetVariants;

public sealed record GetVariantsQuery(IReadOnlyCollection<int> Ids) : IRequest<IReadOnlyList<VariantDetailsResult>>;
