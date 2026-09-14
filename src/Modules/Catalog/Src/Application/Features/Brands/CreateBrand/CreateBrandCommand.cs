using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Brands.CreateBrand;

public sealed record CreateBrandCommand(string Name, string Slug, string? Description) : IRequest<BrandResult>;
