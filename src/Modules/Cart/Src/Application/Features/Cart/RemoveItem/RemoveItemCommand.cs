using MarketAdvanced.Cart.Domain;
using MediatR;

namespace MarketAdvanced.Cart.Application.Features.Cart.RemoveItem;

public sealed record RemoveItemCommand(CartOwner owner, int VariantId) : IRequest;
