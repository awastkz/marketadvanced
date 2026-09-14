using FluentValidation;
using MarketAdvanced.Catalog.Api.Requests;

namespace MarketAdvanced.Catalog.Api.Validators;

public sealed class CategoryValidator : AbstractValidator<CategoryRequest>
{
    public CategoryValidator()
    {
        RuleFor(v => v.Name).NotEmpty().MaximumLength(100);
        RuleFor(v => v.Slug).NotEmpty().MaximumLength(100)
            .Matches("^[a-z0-9-]+$").WithMessage("Только латиница, цифры и дефис");
        RuleFor(v => v.ParentId).GreaterThan(0).When(v => v.ParentId.HasValue);
    }
}
