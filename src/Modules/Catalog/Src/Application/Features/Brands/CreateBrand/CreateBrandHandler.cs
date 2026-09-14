using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Application.Common;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Features.Brands.CreateBrand;

public sealed class CreateBrandHandler : IRequestHandler<CreateBrandCommand, BrandResult>
{
    private readonly IBrandRepository _repo;

    public CreateBrandHandler(IBrandRepository repo)
    {
        _repo = repo;
    }

    public async Task<BrandResult> Handle(CreateBrandCommand request, CancellationToken cancellationToken)
    {
        if (await _repo.SlugExistsAsync(request.Slug, null, cancellationToken))
            throw new ConflictException($"Slug «{request.Slug}» уже занят");

        var brand = new Brand
        {
            Name = request.Name,
            Slug = request.Slug,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description,
        };

        await _repo.AddAsync(brand, cancellationToken);
        return BrandResult.From(brand, 0);
    }
}
