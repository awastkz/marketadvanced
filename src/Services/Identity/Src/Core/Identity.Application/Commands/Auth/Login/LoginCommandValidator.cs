using FluentValidation;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(v => v.Email).NotEmpty().MaximumLength(50);
        RuleFor(v => v.Password).NotEmpty();
    }
}
