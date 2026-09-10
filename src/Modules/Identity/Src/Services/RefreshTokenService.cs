using MarketAdvanced.Api.Contracts.Repositories;

public class RefreshTokenService
{
    private readonly IRefreshTokenRepository _refreshTokenRepo;

    public RefreshTokenService(IRefreshTokenRepository refreshTokenRepository)
    {
        _refreshTokenRepo = refreshTokenRepository;
    }

    public async Task<RefreshToken?> getRefreshTokenAsync(string token)
    {
        return await _refreshTokenRepo.GetByTokenAsync(token);
    }

    public async Task updateAsync(RefreshToken refresh)
    {
        await _refreshTokenRepo.UpdateAsync(refresh);
    }
}
