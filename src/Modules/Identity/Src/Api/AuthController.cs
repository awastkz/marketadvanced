using System.Security.Claims;
using MarketAdvanced.Api.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketAdvanced.Api.Controllers;

[ApiController]
[Route("api/[controller]")]        // → /api/users
public class AuthController : ControllerBase
{
    private readonly AuthService _service;
    private readonly UserService _userService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly IHostEnvironment _env;
    private readonly IConfiguration _config;
    public AuthController(
    AuthService service,
    UserService userService,
    RefreshTokenService refreshTokenService,
    IHostEnvironment env,
    IConfiguration config
    )
    {
        _service = service;
        _userService = userService;
        _refreshTokenService = refreshTokenService;
        _env = env;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> register([FromBody] RegisterRequest r)
    {
        try
        {
            var user = await _service.registerAsync(r);
            return Ok(new UserResponse(user.Id, user.Email, user.CreatedAt));
        }
        catch (Exception ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> login([FromBody] LoginRequest r, IConfiguration config)
    {
        try
        {
            var user = await _service.getUserAsync(r);
            var accessToken = _service.generateAccessToken(user, config);
            var refreshToken = await _service.createRefreshToken(user, Request.Headers.UserAgent.ToString());
            var userResponse = new UserResponse(user.Id, user.Email, user.CreatedAt);
            var refreshTokenResponse = new RefreshTokenResponse(refreshToken.Token, refreshToken.ExpiresAt);

            Response.Cookies.Append("refreshToken", refreshToken.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = !_env.IsDevelopment(),
                SameSite = SameSiteMode.Lax,
                Expires = refreshToken.ExpiresAt,
                Path = "/api",
            });
            return Ok(new {user = userResponse, access_token = accessToken});
        }
        catch(Exception e)
        {
            return Conflict(new {e.Message});
        }
    }

    [HttpGet("refresh")]
    public async Task<IActionResult> refreshToken()
    {
        var refreshTokenCookie = Request.Cookies["refreshToken"];
        if(string.IsNullOrEmpty(refreshTokenCookie)) return Unauthorized();

        var stored = await _refreshTokenService.getRefreshTokenAsync(refreshTokenCookie);
        if (stored is null || stored.IsRevoked || stored.ExpiresAt < DateTime.UtcNow)
          return Unauthorized();

        var user = await _userService.getByIdAsync(stored.UserId, null);
        var accessToken = _service.generateAccessToken(user,_config);
        // ротация: старый токен гасим, выдаём новый — снижает риск при утечке
      stored.IsRevoked = true;
      stored.RevokedAt = DateTime.UtcNow;

      await _service.updateAsync(stored);

        var newRefreshToken = await _service.createRefreshToken(user, Request.Headers.UserAgent.ToString());

        Response.Cookies.Append("refreshToken", newRefreshToken.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = !_env.IsDevelopment(),
                SameSite = SameSiteMode.Lax,
                Expires = newRefreshToken.ExpiresAt,
                Path = "/api",
            });
            return Ok(new {user = new UserResponse(user.Id, user.Email, user.CreatedAt), access_token = accessToken});
    }

}