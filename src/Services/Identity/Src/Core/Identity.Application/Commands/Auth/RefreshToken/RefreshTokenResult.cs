public sealed record RefreshTokenResult(
    Guid UserId,
    string Email,
    DateTime CreatedAt,
    string AccessToken,
    string RefreshToken,
    DateTime RefreshExpiresAt);
