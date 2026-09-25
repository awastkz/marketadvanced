using MediatR;

namespace MarketAdvanced.Catalog.Application.Commands.Attributes.DeleteProductAttribute;

public sealed record DeleteProductAttributeCommand(int Id) : IRequest;
