using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Application.Common;

namespace MarketAdvanced.Catalog.Application.Features.Attributes.DeleteProductAttribute;

public sealed class DeleteProductAttributeHandler : IRequestHandler<DeleteProductAttributeCommand>
{
    private readonly IProductAttributeRepository _repo;

    public DeleteProductAttributeHandler(IProductAttributeRepository repo)
    {
        _repo = repo;
    }

    public async Task Handle(DeleteProductAttributeCommand request, CancellationToken cancellationToken)
    {
        var attribute = await _repo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Атрибут не найден");

        if (await _repo.IsUsedAsync(request.Id, cancellationToken))
            throw new ConflictException("Атрибут используется в товарах, сначала уберите его из них");

        _repo.Remove(attribute);
        await _repo.SaveChangesAsync(cancellationToken);
    }
}
