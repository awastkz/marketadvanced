namespace MarketAdvanced.Identity.Domain;

public class UserProfile
{
    public int Id {get;set;}
    public string? FirstName {get;set;}
    public string? AvatarPath {get;set;}
    public string? LastName {get;set;}
    public string? Phone {get;set;}
    public int? Gender {get;set;}

    public int UserId {get;set;}
    public User User {get;set;} = null!;
}
