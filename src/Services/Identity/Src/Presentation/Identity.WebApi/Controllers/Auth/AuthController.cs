using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using MediatR;

namespace MarketAdvanced.Identity.WebApi.Auth;

[ApiController]
[Route("api/[controller]")]        // → /api/users
[Obsolete("Вход, регистрация и токены переходят в Keycloak; удалить после миграции")]
public class AuthController : ControllerBase
{
    private readonly IHostEnvironment _env;
    private readonly IMediator _mediator;
    public AuthController(IHostEnvironment env, IMediator mediator)
    {
        _env = env;
        _mediator = mediator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> register([FromBody] RegisterRequest r)
    {
        // RePassword — чисто HTTP-поле, в команду не идёт, поэтому проверяем здесь
        if (r.RePassword != r.Password)
        {
            ModelState.AddModelError(nameof(r.RePassword), "Пароли не совпадают");
            return ValidationProblem(ModelState);
        }

        try
        {
            var result = await _mediator.Send(new RegisterUserCommand(r.Email, r.Password));
            return Ok(new UserResponse(result.user.Id, result.user.Email, result.user.CreatedAt));
        }
        catch (Exception ex) when (ex is not ValidationException)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> login([FromBody] LoginRequest r)
    {
        try
        {
            var userAgent = Request.Headers.UserAgent.ToString();
            var result = await _mediator.Send(new LoginCommand(r.Email, r.Password, userAgent));

            Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = !_env.IsDevelopment(),
                SameSite = SameSiteMode.Lax,
                Expires = result.RefreshExpiresAt,
                Path = "/api",
            });
            return Ok(new {user = new UserResponse(result.UserId, result.Email, result.CreatedAt), access_token = result.AccessToken});
        }
        catch (UnauthorizedAccessException e)
        {
            return Unauthorized(new { message = e.Message });
        }
        catch (Exception e) when (e is not ValidationException)
        {
            return Conflict(new { message = e.Message });
        }
    }

    [HttpGet("refresh")]
    public async Task<IActionResult> refreshToken()
    {
        var refreshTokenCookie = Request.Cookies["refreshToken"];
        if(string.IsNullOrEmpty(refreshTokenCookie)) return Unauthorized();

        var refreshTokenCommand = new RefreshTokenCommand(refreshTokenCookie, Request.Headers.UserAgent.ToString());
        RefreshTokenResult result;
        try
        {
            result = await _mediator.Send(refreshTokenCommand);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }

        Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = !_env.IsDevelopment(),
                SameSite = SameSiteMode.Lax,
                Expires = result.RefreshExpiresAt,
                Path = "/api",
            });
            return Ok(new {user = new UserResponse(result.UserId, result.Email, result.CreatedAt), access_token = result.AccessToken});
    }

    [HttpGet("logout")]
    public async Task<IActionResult> logout()
    {
        var token = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(token))
        {
            await _mediator.Send(new LogoutCommand(token));
        }

        Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/api" });
        return Ok();
    }
}
