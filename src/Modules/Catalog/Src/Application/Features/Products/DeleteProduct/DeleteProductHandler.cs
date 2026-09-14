using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Application.Common;

namespace MarketAdvanced.Catalog.Application.Features.Products.DeleteProduct;

public sealed class DeleteProductHandler : IRequestHandler<DeleteProductCommand>
{
    private readonly IProductRepository _repo;

    public DeleteProductHandler(IProductRepository repo)
    {
        _repo = repo;
    }

    public async Task Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _repo.GetWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Товар не найден");

        // TODO: вместе с S3 удалять файлы product.Images из хранилища
        _repo.Remove(product);
        await _repo.SaveChangesAsync(cancellationToken);
    }
}
