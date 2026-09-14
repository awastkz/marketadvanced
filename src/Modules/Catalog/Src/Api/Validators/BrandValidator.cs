using FluentValidation;
using MarketAdvanced.Catalog.Api.Requests;

namespace MarketAdvanced.Catalog.Api.Validators;

public sealed class BrandValidator : AbstractValidator<BrandRequest>
{
    public BrandValidator()
    {
        RuleFor(v => v.Name).NotEmpty().MaximumLength(100);
        RuleFor(v => v.Slug).NotEmpty().MaximumLength(100)
            .Matches("^[a-z0-9-]+$").WithMessage("Только латиница, цифры и дефис");
        RuleFor(v => v.Description).MaximumLength(2000);
    }
}
