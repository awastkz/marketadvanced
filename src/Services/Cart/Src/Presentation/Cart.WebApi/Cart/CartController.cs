using MarketAdvanced.Cart.Domain;
using MarketAdvanced.Cart.Application.Common.Cart;
using MarketAdvanced.Cart.Application.Commands.Cart.AddItem;
using MarketAdvanced.Cart.Application.Queries.Cart.GetCart;
using MarketAdvanced.Cart.Application.Commands.Cart.RemoveItem;
using MediatR;
using MarketAdvanced.Shared.Application.Exceptions;
using MarketAdvanced.Cart.Application.Commands.Cart.ClearItems;

namespace MarketAdvanced.Cart.WebApi.Cart;


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

    [HttpDelete("clear-items")]
    public async Task<IActionResult> Clear()
    {
        await _mediator.Send(new ClearItemsCommand(Owner));
        return NoContent();
    }
}