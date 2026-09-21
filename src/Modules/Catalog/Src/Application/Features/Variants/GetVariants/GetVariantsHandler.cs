using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;

namespace MarketAdvanced.Catalog.Application.Features.Variants.GetVariants;

public sealed class GetVariantsHandler : IRequestHandler<GetVariantsQuery, IReadOnlyList<VariantDetailsResult>>
{
    private readonly IProductRepository _repo;

    public GetVariantsHandler(IProductRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<VariantDetailsResult>> Handle(GetVariantsQuery request, CancellationToken ct)
    {
        if (request.Ids.Count == 0) return [];

        var variants = await _repo.GetVariantsAsync(request.Ids.Distinct().ToList(), ct);
        return variants.Select(VariantDetailsResult.From).ToList();
    }
}
