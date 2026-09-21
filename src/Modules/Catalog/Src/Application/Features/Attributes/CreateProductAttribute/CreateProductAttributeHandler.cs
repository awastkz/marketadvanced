using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Exceptions;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Features.Attributes.CreateProductAttribute;

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
        return ProductAttributeResult.From(attribute);
    }
}
