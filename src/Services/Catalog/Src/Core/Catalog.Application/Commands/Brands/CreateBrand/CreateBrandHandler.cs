using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Application.Exceptions;
using MarketAdvanced.Catalog.Domain;
using MarketAdvanced.Catalog.Application.Common.Brands;

namespace MarketAdvanced.Catalog.Application.Commands.Brands.CreateBrand;

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
            UserId = request.UserId,
        };

        await _repo.AddAsync(brand, cancellationToken);
        await _repo.SaveChangesAsync(cancellationToken);
        return BrandResult.From(brand, 0);
    }
}
