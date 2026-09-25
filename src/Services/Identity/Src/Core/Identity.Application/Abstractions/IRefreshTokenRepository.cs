using MarketAdvanced.Identity.Domain;

namespace MarketAdvanced.Identity.Application.Contracts;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task AddAsync(RefreshToken refreshToken);
    Task UpdateAsync(RefreshToken refreshToken);
}