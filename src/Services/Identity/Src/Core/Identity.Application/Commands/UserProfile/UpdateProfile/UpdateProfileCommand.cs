using MediatR;

public sealed record UpdateProfileCommand(
    Guid UserId,
    string Email,
    string? FirstName,
    string? LastName,
    string? Phone,
    int? Gender,
    UploadedFile? Avatar) : IRequest<ProfileResult>;
