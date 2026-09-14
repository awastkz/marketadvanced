using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Brands.DeleteBrand;

public sealed record DeleteBrandCommand(int Id) : IRequest;
