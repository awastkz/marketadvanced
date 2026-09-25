using MarketAdvanced.Cart.Domain;
using MediatR;
using MarketAdvanced.Cart.Application.Common.Cart;

namespace MarketAdvanced.Cart.Application.Queries.Cart.GetCart;

public sealed record GetCartQuery(CartOwner Owner) : IRequest<CartResult>;
