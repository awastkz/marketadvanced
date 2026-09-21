using MarketAdvanced.Cart.Domain;
using MarketAdvanced.Cart.Api.Requests;
using MarketAdvanced.Cart.Application.Features.Cart;
using MarketAdvanced.Cart.Application.Features.Cart.AddItem;
using MarketAdvanced.Cart.Application.Features.Cart.GetCart;
using MarketAdvanced.Cart.Application.Features.Cart.RemoveItem;
using MediatR;
using MarketAdvanced.Shared.Exceptions;

namespace MarketAdvanced.Cart.Api;


[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;
    private CartOwner Owner => _currentUser.IsAuthenticated
    ? CartOwner.User(_currentUser.Id)
    : _currentUser.GuestId is {} v ? CartOwner.Guest(v)
                                   : throw new UnauthorizedException("Нужен токен или заголовок X-Guest-Id");    
    public CartController(
        IMediator mediator,
        ICurrentUser currentUser
    )
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }
    [HttpGet]
    [ProducesResponseType<CartResult>(StatusCodes.Status200OK)]
    public async Task<ActionResult<CartResult>> Get(CancellationToken ct)
    {
        return Ok(await _mediator.Send(new GetCartQuery(Owner), ct));
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddItemRequest request)
    {
        await _mediator.Send(new AddItemCommand(Owner, request.VariantId, request.Quantity));
        return NoContent();
    }

    [HttpDelete("items")]
    public async Task<IActionResult> RemoveItem(int variantId)
    {
        await _mediator.Send(new RemoveItemCommand(Owner, variantId));
        return NoContent();
    }
}