using MarketAdvanced.Order.Application.Common;
using MarketAdvanced.Order.Application.Services.Catalog;
using MarketAdvanced.Order.Domain.Entities;
using MarketAdvanced.Order.Persistence;
using MarketAdvanced.Shared.Application.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarketAdvanced.Order.WebApi.Public.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;
    private readonly OrderDbContext _db;
    private readonly ICatalogClient _catalog;

    public OrdersController(IMediator mediator, ICurrentUser currentUser, OrderDbContext db, ICatalogClient catalog)
    {
        _mediator = mediator;
        _currentUser = currentUser;
        _db = db;
        _catalog = catalog;
    }

    // вся логика прямо в контроллере, без MediatR: базовая линия для нагрузочных экспериментов
    [HttpPost]
    public async Task<ActionResult<OrderResult>> Create()
    {
        return Ok();
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<OrderResult>(StatusCodes.Status200OK)]
    public Task<ActionResult<OrderResult>> Get(Guid id, CancellationToken ct)
    {
        throw new NotImplementedException();
    }
}
