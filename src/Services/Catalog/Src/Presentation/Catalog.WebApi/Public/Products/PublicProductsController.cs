using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MarketAdvanced.Catalog.Application.Common;
using MarketAdvanced.Catalog.Application.Public.Products;
using MarketAdvanced.Catalog.Application.Public.Products.GetPublicProduct;
using MarketAdvanced.Catalog.Application.Public.Products.SearchPublicProducts;

namespace MarketAdvanced.Catalog.WebApi.Public.Products;

/// <summary>Витрина: товары для гостей и покупателей, только чтение.</summary>
[ApiController]
[AllowAnonymous]
[EnableRateLimiting("api")]
[Route("api/catalog/products")]
public sealed class PublicProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PublicProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType<Paged<PublicProductCard>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<Paged<PublicProductCard>>> Search(
        [FromQuery] string? search,
        [FromQuery] Guid? categoryId,
        [FromQuery] Guid? brandId,
        [FromQuery] PublicProductSort sort = PublicProductSort.New,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 24,
        CancellationToken ct = default) =>
        Ok(await _mediator.Send(new SearchPublicProductsQuery(search, categoryId, brandId, sort, page, pageSize), ct));

    [HttpGet("{slug}")]
    [ProducesResponseType<PublicProductDetails>(StatusCodes.Status200OK)]
    public async Task<ActionResult<PublicProductDetails>> Get(string slug, CancellationToken ct) =>
        Ok(await _mediator.Send(new GetPublicProductQuery(slug), ct));
}
