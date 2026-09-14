using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Brands.UpdateBrand;

public sealed record UpdateBrandCommand(int Id, string Name, string Slug, string? Description) : IRequest<BrandResult>;
