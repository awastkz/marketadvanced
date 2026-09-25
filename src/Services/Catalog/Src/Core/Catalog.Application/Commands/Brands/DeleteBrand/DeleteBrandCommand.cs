using MediatR;

namespace MarketAdvanced.Catalog.Application.Commands.Brands.DeleteBrand;

public sealed record DeleteBrandCommand(int Id) : IRequest;
