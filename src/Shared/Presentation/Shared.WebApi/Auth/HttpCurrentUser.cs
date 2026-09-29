using System.Security.Claims;
using Microsoft.AspNetCore.Http;

public class HttpCurrentUser : ICurrentUser
{

    private readonly IHttpContextAccessor _accessor;

    public HttpCurrentUser(IHttpContextAccessor accessor) => _accessor = accessor;
    public Guid Id
    {
        get
        {
            var user = _accessor.HttpContext?.User;

            // Старые токены (схема Legacy): .NET переименовывает поле id в ClaimTypes.NameIdentifier.
            // Токены Keycloak: MapInboundClaims = false, поле остаётся как в токене — sub
            var value = user?.FindFirstValue(ClaimTypes.NameIdentifier) ?? user?.FindFirstValue("sub");

            return Guid.TryParse(value, out var id) ? id : throw new UnauthorizedAccessException();
        }
    }
    public bool IsAuthenticated => _accessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;

    public Guid? GuestId => Guid.TryParse(_accessor.HttpContext?.Request.Headers["X-Guest-Id"], out var id) ? id : null;
}
