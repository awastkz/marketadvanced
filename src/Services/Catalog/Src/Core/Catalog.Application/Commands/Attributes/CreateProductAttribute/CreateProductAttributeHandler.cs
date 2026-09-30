using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Application.Exceptions;
using MarketAdvanced.Catalog.Domain;
using MarketAdvanced.Catalog.Application.Common.Attributes;

namespace MarketAdvanced.Catalog.Application.Commands.Attributes.CreateProductAttribute;

public sealed class CreateProductAttributeHandler : IRequestHandler<CreateProductAttributeCommand, ProductAttributeResult>
{
    private readonly IProductAttributeRepository _repo;

    public CreateProductAttributeHandler(IProductAttributeRepository repo)
    {
        _repo = repo;
    }

    public async Task<ProductAttributeResult> Handle(CreateProductAttributeCommand request, CancellationToken cancellationToken)
    {
        if (await _repo.SlugExistsAsync(request.Slug, null, cancellationToken))
            throw new ConflictException($"Slug «{request.Slug}» уже занят");

        var attribute = new ProductAttribute
        {
            Name = request.Name,
            Slug = request.Slug,
            Unit = string.IsNullOrWhiteSpace(request.Unit) ? null : request.Unit,
            SortOrder = request.SortOrder,
            UserId = request.UserId,
        };

        await _repo.AddAsync(attribute, cancellationToken);
        await _repo.SaveChangesAsync(cancellationToken);
        return ProductAttributeResult.From(attribute);
    }
}
