using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MarketAdvanced.Catalog.Application.Public.Categories;
using MarketAdvanced.Catalog.Application.Public.Categories.ListPublicCategories;

namespace MarketAdvanced.Catalog.WebApi.Public.Categories;

/// <summary>Витрина: категории для гостей и покупателей, только чтение.</summary>
[ApiController]
[AllowAnonymous]
[EnableRateLimiting("api")]
[Route("api/catalog/categories")]
public sealed class PublicCategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PublicCategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<PublicCategory>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PublicCategory>>> List(CancellationToken ct) =>
        Ok(await _mediator.Send(new ListPublicCategoriesQuery(), ct));
}
