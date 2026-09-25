public sealed record RefreshTokenResult(
    int UserId,
    string Email,
    DateTime CreatedAt,
    string AccessToken,
    string RefreshToken,
    DateTime RefreshExpiresAt);
