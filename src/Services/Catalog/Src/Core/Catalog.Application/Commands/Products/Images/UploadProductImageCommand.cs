using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;

namespace MarketAdvanced.Catalog.Application.Commands.Products.Images;

public sealed record UploadProductImageCommand(Guid ProductId, UploadedFile File) : IRequest<ProductImageResult>;

public sealed class UploadProductImageHandler : IRequestHandler<UploadProductImageCommand, ProductImageResult>
{
    private readonly IProductRepository _repo;

    public UploadProductImageHandler(IProductRepository repo)
    {
        _repo = repo;
    }

    public Task<ProductImageResult> Handle(UploadProductImageCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
