using FluentValidation;
using MarketAdvanced.Cart.Api.Requests;

namespace MarketAdvanced.Cart.Api.Validators;

public sealed class AddItemRequestValidator : AbstractValidator<AddItemRequest>
{
    public AddItemRequestValidator()
    {
        RuleFor(v => v.VariantId).GreaterThan(0);
        RuleFor(v => v.Quantity).GreaterThan(0);
    }
}
