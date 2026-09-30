using System.Security.Claims;
using MarketAdvanced.Identity.Domain;
using MassTransit.Mediator;

public class UserSyncMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        
    await next(ctx);

    }
}