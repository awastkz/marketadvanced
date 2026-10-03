using FluentValidation;

namespace MarketAdvanced.Order.Application.Commands.Orders.CreateOrder;

public sealed class CreateOrderValidation : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderValidation()
    {
    }
}
