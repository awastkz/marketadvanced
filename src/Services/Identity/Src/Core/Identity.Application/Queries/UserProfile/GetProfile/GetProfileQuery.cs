using MediatR;

public sealed record GetProfileQuery(int UserId) : IRequest<ProfileResult>;
