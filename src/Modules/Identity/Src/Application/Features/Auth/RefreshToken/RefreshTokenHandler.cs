using MarketAdvanced.Identity.Application.Contracts;
using MediatR;

public sealed class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenResult>
{
    private readonly IRefreshTokenRepository _refreshRepo;
    private readonly IUserRepository _userRepo;
    private readonly ITokenService _tokenService;

    public RefreshTokenHandler(
        IRefreshTokenRepository refreshRepo,
        IUserRepository userRepo,
        ITokenService tokenService)
    {
        _refreshRepo = refreshRepo;
        _userRepo = userRepo;
        _tokenService = tokenService;
    }

    public async Task<RefreshTokenResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var stored = await _refreshRepo.GetByTokenAsync(request.RefreshTokenCookie);
        if (stored is null || stored.IsRevoked || stored.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid refresh token");

        var user = await _userRepo.findByIdAsync(stored.UserId, null);

        // ротация: старый токен гасим, выдаём новый — снижает риск при утечке
        stored.IsRevoked = true;
        stored.RevokedAt = DateTime.UtcNow;
        await _refreshRepo.UpdateAsync(stored);

        var accessToken = _tokenService.generateAccessToken(user);
        var newRefreshToken = await _tokenService.createRefreshToken(user, request.UserAgent);

        return new RefreshTokenResult(
            user.Id,
            user.Email,
            user.CreatedAt,
            accessToken,
            newRefreshToken.Token,
            newRefreshToken.ExpiresAt);
    }
}
