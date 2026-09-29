namespace MarketAdvanced.Identity.WebApi.Auth;

public record UserResponse(Guid Id, string Email, DateTime CreatedAt);
