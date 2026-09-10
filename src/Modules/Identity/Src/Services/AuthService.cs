using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using MarketAdvanced.Api.Contracts.Repositories;
using MarketAdvanced.Api.DTO;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.IdentityModel.Tokens;

public class AuthService
{
    private readonly IUserRepository _userRepo;
    private readonly IRefreshTokenRepository _refreshTokenRepo;

    public object Response { get; private set; }

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository
        )
    {
        _userRepo = userRepository;
        _refreshTokenRepo = refreshTokenRepository;
    }

    public async Task<User> registerAsync(RegisterRequest r)
    {
        if(await _userRepo.ExistsByEmailAsync(r.Email))
        {
            throw new Exception("Email already exists");
        }

        var user = new User
        {
            Email = r.Email,
        };

        var hasher = new PasswordHasher<User>();
        user.PasswordHash = hasher.HashPassword(user, r.Password);

        await _userRepo.AddAsync(user);

        return user;
    }

    public async Task<User> getUserAsync(LoginRequest r)
    {
        var user = await _userRepo.findUserByEmailAsync(r.Email);
        if(user is null) throw new KeyNotFoundException("404");

        var hasher = new PasswordHasher<User>();
        
        var flag = hasher.VerifyHashedPassword(user, user.PasswordHash, r.Password);

        if(flag != PasswordVerificationResult.Success)
        {
            throw new UnauthorizedAccessException("Error authentication");
        }

        return user;
    }


    public string generateAccessToken(User user, IConfiguration config)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Email),
        };

// конвертируем строку в байты для подписи
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
        issuer: config["Jwt:Issuer"],
        audience: config["Jwt:Audience"],
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

    public async Task updateAsync(RefreshToken token)
  {
      await _refreshTokenRepo.UpdateAsync(token);
  }
  
}