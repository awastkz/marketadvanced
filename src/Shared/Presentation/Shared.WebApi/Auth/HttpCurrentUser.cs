using System.Security.Claims;
using Microsoft.AspNetCore.Http;

public class HttpCurrentUser : ICurrentUser
{

    private readonly IHttpContextAccessor _accessor;

    public HttpCurrentUser(IHttpContextAccessor accessor) => _accessor = accessor;
    public int Id
    {
        get
        {
            var value = _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(value, out var id) ? id : throw new UnauthorizedAccessException();
        }
    }
    public bool IsAuthenticated => _accessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;

    public Guid? GuestId => Guid.TryParse(_accessor.HttpContext?.Request.Headers["X-Guest-Id"], out var id) ? id : null;
}