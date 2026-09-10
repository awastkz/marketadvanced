using FluentValidation;
using MarketAdvanced.Api.DTO;

public class LoginValidator: AbstractValidator<LoginRequest>
{
    public LoginValidator()
    {
        RuleFor(v => v.Email).NotEmpty().MaximumLength(50);
        RuleFor(v => v.Password).NotEmpty();
    }

}