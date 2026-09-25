using MediatR;

public sealed record LogoutCommand(string RefreshToken) : IRequest;
