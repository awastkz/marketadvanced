using MediatR;

public sealed record UpdateProfileCommand(
    int UserId,
    string Email,
    string? FirstName,
    string? LastName,
    string? Phone,
    int? Gender,
    UploadedFile? Avatar) : IRequest<ProfileResult>;
