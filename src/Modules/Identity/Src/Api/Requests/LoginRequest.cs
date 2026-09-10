using System.ComponentModel.DataAnnotations;

namespace MarketAdvanced.Api.DTO;

public class LoginRequest
{
    public string Email {get;set;} = String.Empty;
    public string Password {get;set;} = String.Empty;


}