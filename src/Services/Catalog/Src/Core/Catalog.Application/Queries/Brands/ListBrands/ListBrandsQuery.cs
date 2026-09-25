using MediatR;
using MarketAdvanced.Catalog.Application.Common.Brands;

namespace MarketAdvanced.Catalog.Application.Queries.Brands.ListBrands;

public sealed record ListBrandsQuery() : IRequest<IReadOnlyList<BrandResult>>;
