using FluentValidation;

namespace MarketAdvanced.Catalog.Application.Commands.Categories.CreateCategory;

public sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(v => v.Name).NotEmpty().MaximumLength(100);
        RuleFor(v => v.Slug).NotEmpty().MaximumLength(100)
            .Matches("^[a-z0-9-]+$").WithMessage("Только латиница, цифры и дефис");
        RuleFor(v => v.ParentId).GreaterThan(0).When(v => v.ParentId.HasValue);
    }
}
