namespace MarketAdvanced.Identity.WebApi.Profile;

public record UserProfileResponse(
    Guid Id,
    string Email,
    string? FirstName,
    string? LastName,
    string? Phone,
    int? Gender,
    string? AvatarUrl
);
