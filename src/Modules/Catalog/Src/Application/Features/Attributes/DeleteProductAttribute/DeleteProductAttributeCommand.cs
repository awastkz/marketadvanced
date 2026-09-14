using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Attributes.DeleteProductAttribute;

public sealed record DeleteProductAttributeCommand(int Id) : IRequest;
