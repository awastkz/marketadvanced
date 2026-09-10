using System.ComponentModel.DataAnnotations;

namespace MarketAdvanced.Api.DTO;

public class RegisterRequest
{
    public string Email {get;set;} = String.Empty;
    public string Password {get;set;} = String.Empty;
    public string RePassword {get;set;} = String.Empty;

}