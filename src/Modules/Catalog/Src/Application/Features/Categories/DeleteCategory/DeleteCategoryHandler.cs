using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Exceptions;

namespace MarketAdvanced.Catalog.Application.Features.Categories.DeleteCategory;

public sealed class DeleteCategoryHandler : IRequestHandler<DeleteCategoryCommand>
{
    private readonly ICategoryRepository _repo;

    public DeleteCategoryHandler(ICategoryRepository repo)
    {
        _repo = repo;
    }

    public async Task Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _repo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Категория не найдена");

        if (await _repo.HasChildrenAsync(request.Id, cancellationToken))
            throw new ConflictException("Сначала удалите подкатегории");
        if (await _repo.ProductsCountAsync(request.Id, cancellationToken) > 0)
            throw new ConflictException("В категории есть товары");

        _repo.Remove(category);
        await _repo.SaveChangesAsync(cancellationToken);
    }
}
