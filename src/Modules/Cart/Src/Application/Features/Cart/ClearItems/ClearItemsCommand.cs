using MarketAdvanced.Cart.Domain;
using MediatR;

namespace MarketAdvanced.Cart.Application.Features.Cart.ClearItems;

public sealed record ClearItemsCommand(ShoppingCart cart) : IRequest;
