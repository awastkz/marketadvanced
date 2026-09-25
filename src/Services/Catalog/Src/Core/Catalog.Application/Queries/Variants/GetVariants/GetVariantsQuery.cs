using MediatR;
using MarketAdvanced.Catalog.Application.Common.Variants;

namespace MarketAdvanced.Catalog.Application.Queries.Variants.GetVariants;

public sealed record GetVariantsQuery(IReadOnlyCollection<int> Ids) : IRequest<IReadOnlyList<VariantDetailsResult>>;
