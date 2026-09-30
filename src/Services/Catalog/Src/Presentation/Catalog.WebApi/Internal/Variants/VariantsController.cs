using MediatR;
using MarketAdvanced.Catalog.Application.Queries.Variants.GetVariant;
using MarketAdvanced.Catalog.Application.Queries.Variants.GetVariants;

namespace MarketAdvanced.Catalog.WebApi.Internal.Variants;

/// <summary>Внутреннее API вариантов для других сервисов (Cart, Order). Витрине отдельные эндпоинты.</summary>
[ApiController]
[Route("api/internal/variants")]
[ApiExplorerSettings(GroupName = "catalog-internal")]
public sealed class VariantsController : ControllerBase
{
    private readonly IMediator _mediator;

    public VariantsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Пакетное чтение вариантов по списку id (параметр ids повторяется: ?ids=1, ids=2). Неизвестные id не попадают в ответ.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<VariantResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<VariantResponse>>> List([FromQuery] Guid[] ids, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetVariantsQuery(ids), ct);
        return Ok(result.Select(VariantResponse.From).ToList());
    }

    /// <summary>Вариант по id. 404, если варианта нет.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType<VariantResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VariantResponse>> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetVariantQuery(id), ct);
        return Ok(VariantResponse.From(result));
    }
}
