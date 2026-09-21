using MediatR;
using MarketAdvanced.Catalog.Api.Responses;
using MarketAdvanced.Catalog.Application.Features.Variants.GetVariant;
using MarketAdvanced.Catalog.Application.Features.Variants.GetVariants;

namespace MarketAdvanced.Catalog.Api.Controllers;

/// <summary>Публичное API вариантов: используется другими сервисами (Cart, Order) и витриной.</summary>
[ApiController]
[Route("api/variants")]
public sealed class VariantsController : ControllerBase
{
    private readonly IMediator _mediator;

    public VariantsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Пакетное чтение: GET api/variants?ids=1&amp;ids=2. Неизвестные id не попадают в ответ.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<VariantResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<VariantResponse>>> List([FromQuery] int[] ids, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetVariantsQuery(ids), ct);
        return Ok(result.Select(VariantResponse.From).ToList());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType<VariantResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VariantResponse>> Get(int id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetVariantQuery(id), ct);
        return Ok(VariantResponse.From(result));
    }
}
