using MediatR;

public sealed record RemoveAvatarCommand(Guid UserId) : IRequest<ProfileResult>;
