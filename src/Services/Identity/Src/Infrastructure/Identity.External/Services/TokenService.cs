using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using MarketAdvanced.Identity.Application.Contracts;
using MarketAdvanced.Identity.Domain;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

[Obsolete("Вход, регистрация и токены переходят в Keycloak; удалить после миграции")]
public class TokenService : ITokenService
{
    private readonly JwtOptions _jwtOptions;
    private readonly IRefreshTokenRepository _refreshTokenRepo;

    public TokenService(IOptions<JwtOptions> jwtOptions, IRefreshTokenRepository refreshTokenRepo)
    {
        _jwtOptions = jwtOptions.Value;
        _refreshTokenRepo = refreshTokenRepo;
    }

    public string generateAccessToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Email),
        };

        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_jwtOptions.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
        issuer: _jwtOptions.Issuer,
        audience: _jwtOptions.Audience,
        claims: claims,
        expires: DateTime.UtcNow.AddHours(1),
        signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<RefreshToken> createRefreshToken(User user, string userAgent)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var deviceId = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        
        var model = new RefreshToken
        {
    Token = token,
    ExpiresAt = DateTime.UtcNow.AddDays(30),
    IsRevoked = false,
    DeviceId = deviceId,
    UserAgent = userAgent,
    UserId = user.Id,
};

await _refreshTokenRepo.AddAsync(model);

        return model;
    }
}