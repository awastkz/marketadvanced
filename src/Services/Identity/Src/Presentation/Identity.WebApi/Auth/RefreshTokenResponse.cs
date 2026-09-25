namespace MarketAdvanced.Identity.WebApi.Auth;

public record RefreshTokenResponse(string Token, DateTime ExpiresAt);
