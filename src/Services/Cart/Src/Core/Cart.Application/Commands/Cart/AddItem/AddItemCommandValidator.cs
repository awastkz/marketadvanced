using FluentValidation;

namespace MarketAdvanced.Cart.Application.Commands.Cart.AddItem;

public sealed class AddItemCommandValidator : AbstractValidator<AddItemCommand>
{
    public AddItemCommandValidator()
    {
        RuleFor(v => v.VariantId).GreaterThan(0);
        RuleFor(v => v.Quantity).GreaterThan(0);
    }
}
