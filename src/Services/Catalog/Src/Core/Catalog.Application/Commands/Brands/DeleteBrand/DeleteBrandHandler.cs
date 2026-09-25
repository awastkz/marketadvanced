using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Application.Exceptions;

namespace MarketAdvanced.Catalog.Application.Commands.Brands.DeleteBrand;

public sealed class DeleteBrandHandler : IRequestHandler<DeleteBrandCommand>
{
    private readonly IBrandRepository _repo;

    public DeleteBrandHandler(IBrandRepository repo)
    {
        _repo = repo;
    }

    public async Task Handle(DeleteBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _repo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Бренд не найден");

        // у товаров этого бренда BrandId станет null (SetNull в конфигурации)
        _repo.Remove(brand);
        await _repo.SaveChangesAsync(cancellationToken);
    }
}
