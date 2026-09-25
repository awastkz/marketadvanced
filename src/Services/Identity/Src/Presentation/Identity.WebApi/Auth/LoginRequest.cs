using System.ComponentModel.DataAnnotations;

namespace MarketAdvanced.Identity.WebApi.Auth;

public class LoginRequest
{
    public string Email {get;set;} = String.Empty;
    public string Password {get;set;} = String.Empty;

}