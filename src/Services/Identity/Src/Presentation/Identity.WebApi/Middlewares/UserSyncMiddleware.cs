using System.Security.Claims;
using MarketAdvanced.Identity.Domain;
using MassTransit.Mediator;

public class UserSyncMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext ctx, IMediator mediator)
    {
        var sub = ctx.User.FindFirstValue("sub");
        var email = ctx.User.FindFirstValue("email");
        if(Guid.TryParse(sub, out var userId))
        {
            var user = mediator.Send(new GetUserQuery(userId));
        }
    }
}