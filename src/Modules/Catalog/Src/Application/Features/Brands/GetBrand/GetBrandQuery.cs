using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Brands.GetBrand;

public sealed record GetBrandQuery(int Id) : IRequest<BrandResult>;
