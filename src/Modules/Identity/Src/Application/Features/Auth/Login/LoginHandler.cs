using MarketAdvanced.Identity.Application.Contracts;
using MarketAdvanced.Identity.Domain;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

public sealed class LoginHandler : IRequestHandler<LoginCommand, LoginResult>
{
    private readonly IUserRepository _userRepo;
    private readonly ITokenService _tokenService;
    public LoginHandler(IUserRepository userRepo, ITokenService tokenService)
    {
        _userRepo = userRepo;
        _tokenService = tokenService;
    }

    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepo.findByEmailAsync(request.Email);
  if (user is null) throw new UnauthorizedAccessException("Invalid credentials");

  var verify = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password);
  if (verify == PasswordVerificationResult.Failed) throw new UnauthorizedAccessException("Invalid credentials");

        var accessToken = _tokenService.generateAccessToken(user);
        var refreshToken = await _tokenService.createRefreshToken(user, request.UserAgent);

        return new LoginResult(user.Id, request.Email, user.CreatedAt, accessToken, refreshToken.Token, refreshToken.ExpiresAt);
    }
}