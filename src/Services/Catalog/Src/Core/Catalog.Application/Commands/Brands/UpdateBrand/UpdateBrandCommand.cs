using MediatR;
using MarketAdvanced.Catalog.Application.Common.Brands;

namespace MarketAdvanced.Catalog.Application.Commands.Brands.UpdateBrand;

public sealed record UpdateBrandCommand(int Id, string Name, string Slug, string? Description) : IRequest<BrandResult>;
