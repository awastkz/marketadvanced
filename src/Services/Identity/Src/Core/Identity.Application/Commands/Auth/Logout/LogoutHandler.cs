using MarketAdvanced.Identity.Application.Contracts;
using MediatR;

public sealed class LogoutHandler : IRequestHandler<LogoutCommand>
{
    private readonly IRefreshTokenRepository _refreshTokenRepo;

    public LogoutHandler(IRefreshTokenRepository refreshTokenRepo)
    {
        _refreshTokenRepo = refreshTokenRepo;
    }

    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var stored = await _refreshTokenRepo.GetByTokenAsync(request.RefreshToken);
        // уже отозван или cookie не наша — выход всё равно успешен
        if (stored is null || stored.IsRevoked) return;

        stored.IsRevoked = true;
        stored.RevokedAt = DateTime.UtcNow;
        await _refreshTokenRepo.UpdateAsync(stored);
    }
}
