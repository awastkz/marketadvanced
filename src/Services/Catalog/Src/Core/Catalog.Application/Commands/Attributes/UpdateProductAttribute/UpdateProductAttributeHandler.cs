using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Application.Exceptions;
using MarketAdvanced.Catalog.Application.Common.Attributes;

namespace MarketAdvanced.Catalog.Application.Commands.Attributes.UpdateProductAttribute;

public sealed class UpdateProductAttributeHandler : IRequestHandler<UpdateProductAttributeCommand, ProductAttributeResult>
{
    private readonly IProductAttributeRepository _repo;

    public UpdateProductAttributeHandler(IProductAttributeRepository repo)
    {
        _repo = repo;
    }

    public async Task<ProductAttributeResult> Handle(UpdateProductAttributeCommand request, CancellationToken cancellationToken)
    {
        var attribute = await _repo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Атрибут не найден");

        if (await _repo.SlugExistsAsync(request.Slug, request.Id, cancellationToken))
            throw new ConflictException($"Slug «{request.Slug}» уже занят");

        attribute.Name = request.Name;
        attribute.Slug = request.Slug;
        attribute.Unit = string.IsNullOrWhiteSpace(request.Unit) ? null : request.Unit;
        attribute.SortOrder = request.SortOrder;
        attribute.UpdatedAt = DateTime.UtcNow;

        await _repo.SaveChangesAsync(cancellationToken);
        return ProductAttributeResult.From(attribute);
    }
}
