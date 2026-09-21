using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Shared.Exceptions;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Application.Features.Categories.CreateCategory;

public sealed class CreateCategoryHandler : IRequestHandler<CreateCategoryCommand, CategoryResult>
{
    private readonly ICategoryRepository _repo;

    public CreateCategoryHandler(ICategoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<CategoryResult> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        if (await _repo.SlugExistsAsync(request.Slug, null, cancellationToken))
            throw new ConflictException($"Slug «{request.Slug}» уже занят");

        if (request.ParentId is not null && !await _repo.ExistsAsync(request.ParentId.Value, cancellationToken))
            throw new NotFoundException("Родительская категория не найдена");

        var category = new Category
        {
            Name = request.Name,
            Slug = request.Slug,
            SortOrder = request.SortOrder,
            ParentId = request.ParentId,
            UserId = request.UserId,
        };

        await _repo.AddAsync(category, cancellationToken);
        return CategoryResult.From(category, 0);
    }
}
