using MarketAdvanced.Cart.Domain;
using MediatR;

namespace MarketAdvanced.Cart.Application.Commands.Cart.AddItem;

public sealed record AddItemCommand(CartOwner Owner, Guid VariantId, int Quantity) : IRequest;
