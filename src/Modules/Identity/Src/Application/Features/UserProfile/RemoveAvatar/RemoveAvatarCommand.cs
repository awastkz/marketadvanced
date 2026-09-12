using MediatR;

public sealed record RemoveAvatarCommand(int UserId) : IRequest<ProfileResult>;
