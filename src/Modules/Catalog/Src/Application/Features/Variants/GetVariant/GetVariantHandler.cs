using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Exceptions;

namespace MarketAdvanced.Catalog.Application.Features.Variants.GetVariant;

public sealed class GetVariantHandler : IRequestHandler<GetVariantQuery, VariantDetailsResult>
{
    private readonly IProductRepository _repo;

    public GetVariantHandler(IProductRepository repo)
    {
        _repo = repo;
    }

    public async Task<VariantDetailsResult> Handle(GetVariantQuery request, CancellationToken ct)
    {
        var variant = await _repo.GetVariantAsync(request.Id, ct)
            ?? throw new NotFoundException("Вариант не найден");

        return VariantDetailsResult.From(variant);
    }
}
