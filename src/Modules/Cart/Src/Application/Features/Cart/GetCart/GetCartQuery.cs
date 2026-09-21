using MarketAdvanced.Cart.Domain;
using MediatR;

namespace MarketAdvanced.Cart.Application.Features.Cart.GetCart;

public sealed record GetCartQuery(CartOwner Owner) : IRequest<CartResult>;
