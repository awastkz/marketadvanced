using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Application.Common;

namespace MarketAdvanced.Catalog.Application.Features.Brands.UpdateBrand;

public sealed class UpdateBrandHandler : IRequestHandler<UpdateBrandCommand, BrandResult>
{
    private readonly IBrandRepository _repo;

    public UpdateBrandHandler(IBrandRepository repo)
    {
        _repo = repo;
    }

    public async Task<BrandResult> Handle(UpdateBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _repo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Бренд не найден");

        if (await _repo.SlugExistsAsync(request.Slug, request.Id, cancellationToken))
            throw new ConflictException($"Slug «{request.Slug}» уже занят");

        brand.Name = request.Name;
        brand.Slug = request.Slug;
        brand.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description;
        brand.UpdatedAt = DateTime.UtcNow;

        await _repo.SaveChangesAsync(cancellationToken);
        return BrandResult.From(brand, await _repo.ProductsCountAsync(brand.Id, cancellationToken));
    }
}
