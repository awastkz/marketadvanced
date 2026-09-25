using MediatR;

public sealed record RefreshTokenCommand(string RefreshTokenCookie, string? UserAgent) : IRequest<RefreshTokenResult>;
