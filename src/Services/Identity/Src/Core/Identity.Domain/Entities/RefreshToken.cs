namespace MarketAdvanced.Identity.Domain;

[Obsolete("Вход, регистрация и токены переходят в Keycloak; удалить после миграции")]
public class RefreshToken
{
    public Guid Id { get; set; }

    public string Token { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public bool IsRevoked { get; set; }

    public string DeviceId { get; set; } = null!;

    public string? UserAgent { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? RevokedAt { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;
}