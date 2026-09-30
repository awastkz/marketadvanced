using MarketAdvanced.Cart.Domain;
using MediatR;

namespace MarketAdvanced.Cart.Application.Commands.Cart.RemoveItem;

public sealed record RemoveItemCommand(CartOwner owner, Guid VariantId) : IRequest;
