using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;

namespace MarketAdvanced.Catalog.Application.Features.Attributes.ListAttributes;

public sealed class ListAttributesHandler : IRequestHandler<ListAttributesQuery, IReadOnlyList<ProductAttributeResult>>
{
    private readonly IProductAttributeRepository _repo;

    public ListAttributesHandler(IProductAttributeRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<ProductAttributeResult>> Handle(ListAttributesQuery request, CancellationToken cancellationToken)
    {
        var rows = await _repo.ListAsync(cancellationToken);
        return rows.Select(ProductAttributeResult.From).ToList();
    }
}
