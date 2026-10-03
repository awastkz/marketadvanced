using MarketAdvanced.Order.Application.Common;
using MediatR;

namespace MarketAdvanced.Order.WebApi.Public.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public OrdersController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    [HttpPost]
    [ProducesResponseType<OrderResult>(StatusCodes.Status201Created)]
    public Task<ActionResult<OrderResult>> Create(CreateOrderRequest request, CancellationToken ct)
    {
        throw new NotImplementedException();
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<OrderResult>(StatusCodes.Status200OK)]
    public Task<ActionResult<OrderResult>> Get(Guid id, CancellationToken ct)
    {
        throw new NotImplementedException();
    }
}
