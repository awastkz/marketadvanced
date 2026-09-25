using System.ComponentModel.DataAnnotations;

namespace MarketAdvanced.Identity.WebApi.Auth;

public class RegisterRequest
{
    public string Email {get;set;} = String.Empty;
    public string Password {get;set;} = String.Empty;
    public string RePassword {get;set;} = String.Empty;

}