using Amazon.Runtime.Internal;
using MediatR;

public record LoginCommand(string Email, string Password, string? UserAgent) : IRequest<LoginResult>;