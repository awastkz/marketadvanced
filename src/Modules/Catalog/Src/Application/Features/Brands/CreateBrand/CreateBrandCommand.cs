using MediatR;

namespace MarketAdvanced.Catalog.Application.Features.Brands.CreateBrand;

public sealed record CreateBrandCommand(int UserId, string Name, string Slug, string? Description) : IRequest<BrandResult>;
