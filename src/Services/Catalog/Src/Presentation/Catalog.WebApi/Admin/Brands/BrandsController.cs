using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MarketAdvanced.Catalog.Application.Commands.Brands.CreateBrand;
using MarketAdvanced.Catalog.Application.Commands.Brands.DeleteBrand;
using MarketAdvanced.Catalog.Application.Queries.Brands.GetBrand;
using MarketAdvanced.Catalog.Application.Queries.Brands.ListBrands;
using MarketAdvanced.Catalog.Application.Commands.Brands.UpdateBrand;

namespace MarketAdvanced.Catalog.WebApi.Admin.Brands;

[ApiController]
[Authorize]
[Route("api/admin/brands")]
public sealed class BrandsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public BrandsController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct) =>
        Ok(await _mediator.Send(new ListBrandsQuery(), ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken ct) =>
        Ok(await _mediator.Send(new GetBrandQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] BrandRequest r, CancellationToken ct) =>
        Ok(await _mediator.Send(new CreateBrandCommand(_currentUser.Id, r.Name.Trim(), r.Slug.Trim(), r.Description?.Trim()), ct));

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] BrandRequest r, CancellationToken ct) =>
        Ok(await _mediator.Send(new UpdateBrandCommand(id, r.Name.Trim(), r.Slug.Trim(), r.Description?.Trim()), ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteBrandCommand(id), ct);
        return NoContent();
    }
}
