namespace MarketAdvanced.Api.DTO;

public record RefreshTokenResponse(string Token, DateTime ExpiresAt);
