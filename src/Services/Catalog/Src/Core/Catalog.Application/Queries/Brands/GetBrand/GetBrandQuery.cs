using MediatR;
using MarketAdvanced.Catalog.Application.Common.Brands;

namespace MarketAdvanced.Catalog.Application.Queries.Brands.GetBrand;

public sealed record GetBrandQuery(Guid Id) : IRequest<BrandResult>;
