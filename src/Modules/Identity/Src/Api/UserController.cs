using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;

namespace MarketAdvanced.Identity.Api;

[Authorize]
[ApiController]
[Route("api/[controller]")]        // → /api/user
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;

    public UserController(IMediator mediator)
    {
        _mediator = mediator;
    }
}
