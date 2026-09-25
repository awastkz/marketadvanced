using MediatR;

public sealed record RegisterUserCommand(string Email, string Password) : IRequest<RegisterUserResult>;
