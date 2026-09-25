using FluentValidation;

/// <summary>Совпадение Password/RePassword проверяет AuthController: RePassword в команду не идёт.</summary>
public sealed class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(v => v.Email).NotEmpty().MaximumLength(50);
        RuleFor(v => v.Password).NotEmpty();
    }
}
