using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MarketAdvanced.Catalog.Application.Commands.Categories.CreateCategory;
using MarketAdvanced.Catalog.Application.Commands.Categories.DeleteCategory;
using MarketAdvanced.Catalog.Application.Queries.Categories.GetCategory;
using MarketAdvanced.Catalog.Application.Queries.Categories.ListCategories;
using MarketAdvanced.Catalog.Application.Commands.Categories.UpdateCategory;

namespace MarketAdvanced.Catalog.WebApi.Admin.Categories;

[ApiController]
[Authorize]
[Route("api/admin/categories")]
public sealed class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public CategoriesController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    /// <summary>Плоский список, дерево фронт строит по parentId.</summary>
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct) =>
        Ok(await _mediator.Send(new ListCategoriesQuery(), ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken ct) =>
        Ok(await _mediator.Send(new GetCategoryQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CategoryRequest r, CancellationToken ct) =>
        Ok(await _mediator.Send(new CreateCategoryCommand(_currentUser.Id, r.Name.Trim(), r.Slug.Trim(), r.SortOrder, r.ParentId), ct));

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] CategoryRequest r, CancellationToken ct) =>
        Ok(await _mediator.Send(new UpdateCategoryCommand(id, r.Name.Trim(), r.Slug.Trim(), r.SortOrder, r.ParentId), ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteCategoryCommand(id), ct);
        return NoContent();
    }
}
