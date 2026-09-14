using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Brands.ListBrands;

public sealed record ListBrandsQuery() : IRequest<IReadOnlyList<BrandResult>>;
