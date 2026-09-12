using FluentValidation;
using MarketAdvanced.Identity.Api.Requests;

namespace MarketAdvanced.Identity.Api.Validators;

public class LoginValidator: AbstractValidator<LoginRequest>
{
    public LoginValidator()
    {
        RuleFor(v => v.Email).NotEmpty().MaximumLength(50);
        RuleFor(v => v.Password).NotEmpty();
    }

}