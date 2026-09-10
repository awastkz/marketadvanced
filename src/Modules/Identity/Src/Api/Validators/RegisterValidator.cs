using FluentValidation;
using MarketAdvanced.Api.DTO;

public class RegisterValidator: AbstractValidator<RegisterRequest>
{
    public RegisterValidator()
    {
        RuleFor(v => v.Email).NotEmpty().MaximumLength(50);
        RuleFor(v => v.Password).NotEmpty();
        RuleFor(v => v.RePassword).NotEmpty().Equal(v => v.Password);
    }

}