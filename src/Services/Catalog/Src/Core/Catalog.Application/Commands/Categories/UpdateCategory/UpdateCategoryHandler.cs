using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Application.Exceptions;
using MarketAdvanced.Catalog.Application.Common.Categories;

namespace MarketAdvanced.Catalog.Application.Commands.Categories.UpdateCategory;

public sealed class UpdateCategoryHandler : IRequestHandler<UpdateCategoryCommand, CategoryResult>
{
    private readonly ICategoryRepository _repo;

    public UpdateCategoryHandler(ICategoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<CategoryResult> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _repo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Категория не найдена");

        if (await _repo.SlugExistsAsync(request.Slug, request.Id, cancellationToken))
            throw new ConflictException($"Slug «{request.Slug}» уже занят");

        if (request.ParentId is not null)
        {
            if (request.ParentId == request.Id)
                throw new ConflictException("Категория не может быть родителем самой себя");
            if (!await _repo.ExistsAsync(request.ParentId.Value, cancellationToken))
                throw new NotFoundException("Родительская категория не найдена");
            if (await IsDescendantAsync(request.Id, request.ParentId.Value, cancellationToken))
                throw new ConflictException("Нельзя переносить категорию внутрь её подкатегории");
        }

        category.Name = request.Name;
        category.Slug = request.Slug;
        category.SortOrder = request.SortOrder;
        category.ParentId = request.ParentId;
        category.UpdatedAt = DateTime.UtcNow;

        await _repo.SaveChangesAsync(cancellationToken);
        return CategoryResult.From(category, await _repo.ProductsCountAsync(category.Id, cancellationToken));
    }

    // candidateId лежит в поддереве rootId?
    private async Task<bool> IsDescendantAsync(int rootId, int candidateId, CancellationToken ct)
    {
        var all = await _repo.ListAsync(ct);
        var parentOf = all.ToDictionary(r => r.Category.Id, r => r.Category.ParentId);
        var current = parentOf.GetValueOrDefault(candidateId);
        while (current is not null)
        {
            if (current == rootId) return true;
            current = parentOf.GetValueOrDefault(current.Value);
        }
        return false;
    }
}
