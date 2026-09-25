using MarketAdvanced.Cart.Domain;
using MediatR;

namespace MarketAdvanced.Cart.Application.Commands.Cart.ClearItems;

public sealed record ClearItemsCommand(CartOwner Owner) : IRequest;
