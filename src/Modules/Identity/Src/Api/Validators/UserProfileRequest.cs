using System.ComponentModel.DataAnnotations;

namespace MarketAdvanced.Identity.Api.Requests;

public class UserProfileRequest
{
    public int Id {get;set;}
    public string Email {get; set;}
    public string? Name {get;set;}
    public string? Surname {get;set;}
    public string? Phone {get;set;}
    public int? Gender {get;set;}
    public IFormFile? Avatar {get;set;}
}