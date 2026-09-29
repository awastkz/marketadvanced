public sealed record ProfileResult(
    Guid Id,
    string Email,
    string? FirstName,
    string? LastName,
    string? Phone,
    int? Gender,
    string? AvatarPath);
