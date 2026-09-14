using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Application.Common;

namespace MarketAdvanced.Catalog.Application.Features.Attributes.GetProductAttribute;

public sealed class GetProductAttributeHandler : IRequestHandler<GetProductAttributeQuery, ProductAttributeResult>
{
    private readonly IProductAttributeRepository _repo;

    public GetProductAttributeHandler(IProductAttributeRepository repo)
    {
        _repo = repo;
    }

    public async Task<ProductAttributeResult> Handle(GetProductAttributeQuery request, CancellationToken cancellationToken)
    {
        var attribute = await _repo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Атрибут не найден");
        return ProductAttributeResult.From(attribute);
    }
}
