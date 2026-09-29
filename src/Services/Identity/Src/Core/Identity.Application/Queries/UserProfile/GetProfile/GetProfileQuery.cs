using MediatR;

public sealed record GetProfileQuery(Guid UserId) : IRequest<ProfileResult>;
