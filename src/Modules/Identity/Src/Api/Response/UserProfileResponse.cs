public record UserProfileResponse(
    int Id,
    string Email,
    string? FirstName,
    string? LastName,
    string? Phone,
    int? Gender,
    string? AvatarUrl
);
