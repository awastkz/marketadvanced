using System.Security.Claims;
using MarketAdvanced.Api.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketAdvanced.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]        // → /api/users
public class UserController : ControllerBase
{
    private readonly UserService _service;
    private readonly AuthService _authService;
    private readonly RefreshTokenService _refreshTokenService;

    public UserController(UserService service, AuthService authService, RefreshTokenService refreshTokenService)
    {
        _service = service;
        _authService = authService;
        _refreshTokenService = refreshTokenService;
    }

    [HttpGet("logout")]
    public async Task<IActionResult> logout()
    {
        var token = Request.Cookies["refreshToken"];
        if(string.IsNullOrEmpty(token)) return Conflict("Error");
        var model = await _refreshTokenService.getRefreshTokenAsync(token);
        model.IsRevoked = true;

        await _refreshTokenService.updateAsync(model);
        
        Response.Cookies.Delete("refreshToken", new CookieOptions{Path = "/api"});

        return Ok();
    }
}