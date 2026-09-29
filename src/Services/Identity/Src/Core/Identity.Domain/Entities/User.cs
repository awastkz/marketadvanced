namespace MarketAdvanced.Identity.Domain;

public class User
{
    public Guid Id {get;set;}
    public string Email {get;set;}
    public string PasswordHash {get;set;} = String.Empty;
    public DateTime CreatedAt {get;set;} = DateTime.UtcNow;

    public UserProfile Profile {get;set;}
    public ICollection<RefreshToken> RefreshTokens {get;set;}
}