using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MarketAdvanced.Catalog.Application.Commands.Attributes.CreateProductAttribute;
using MarketAdvanced.Catalog.Application.Commands.Attributes.DeleteProductAttribute;
using MarketAdvanced.Catalog.Application.Queries.Attributes.GetProductAttribute;
using MarketAdvanced.Catalog.Application.Queries.Attributes.ListAttributes;
using MarketAdvanced.Catalog.Application.Commands.Attributes.UpdateProductAttribute;

namespace MarketAdvanced.Catalog.WebApi.Admin.Attributes;

[ApiController]
[Authorize]
[Route("api/admin/attributes")]
public sealed class AttributesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public AttributesController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct) =>
        Ok(await _mediator.Send(new ListAttributesQuery(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct) =>
        Ok(await _mediator.Send(new GetProductAttributeQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductAttributeRequest r, CancellationToken ct) =>
        Ok(await _mediator.Send(new CreateProductAttributeCommand(_currentUser.Id, r.Name.Trim(), r.Slug.Trim(), r.Unit?.Trim(), r.SortOrder), ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProductAttributeRequest r, CancellationToken ct) =>
        Ok(await _mediator.Send(new UpdateProductAttributeCommand(id, r.Name.Trim(), r.Slug.Trim(), r.Unit?.Trim(), r.SortOrder), ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteProductAttributeCommand(id), ct);
        return NoContent();
    }
}
