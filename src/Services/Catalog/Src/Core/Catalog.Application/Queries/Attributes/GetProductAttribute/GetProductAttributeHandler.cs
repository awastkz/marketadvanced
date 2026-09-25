using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Application.Exceptions;
using MarketAdvanced.Catalog.Application.Common.Attributes;

namespace MarketAdvanced.Catalog.Application.Queries.Attributes.GetProductAttribute;

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
