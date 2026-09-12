namespace MarketAdvanced.Identity.Api.Responses;

public record RefreshTokenResponse(string Token, DateTime ExpiresAt);
