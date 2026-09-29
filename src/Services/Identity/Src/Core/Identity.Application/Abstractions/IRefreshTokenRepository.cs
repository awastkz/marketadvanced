using MarketAdvanced.Identity.Domain;

namespace MarketAdvanced.Identity.Application.Contracts;

[Obsolete("Вход, регистрация и токены переходят в Keycloak; удалить после миграции")]
public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task AddAsync(RefreshToken refreshToken);
    Task UpdateAsync(RefreshToken refreshToken);
}