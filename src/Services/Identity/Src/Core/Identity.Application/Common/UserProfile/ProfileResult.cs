public sealed record ProfileResult(
    int Id,
    string Email,
    string? FirstName,
    string? LastName,
    string? Phone,
    int? Gender,
    string? AvatarPath);
