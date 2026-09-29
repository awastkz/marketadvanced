using MarketAdvanced.Identity.Domain;

[Obsolete("Вход, регистрация и токены переходят в Keycloak; удалить после миграции")]
public interface ITokenService
{
    public string generateAccessToken(User user);
    public Task<RefreshToken> createRefreshToken(User user, string userAgent);
}