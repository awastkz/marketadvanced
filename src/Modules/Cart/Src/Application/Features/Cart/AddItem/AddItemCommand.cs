using MarketAdvanced.Cart.Domain;
using MediatR;

namespace MarketAdvanced.Cart.Application.Features.Cart.AddItem;

public sealed record AddItemCommand(CartOwner Owner, int VariantId, int Quantity) : IRequest;
