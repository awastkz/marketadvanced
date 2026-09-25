using MarketAdvanced.Identity.Domain;

public interface ITokenService
{
    public string generateAccessToken(User user);
    public Task<RefreshToken> createRefreshToken(User user, string userAgent);
}