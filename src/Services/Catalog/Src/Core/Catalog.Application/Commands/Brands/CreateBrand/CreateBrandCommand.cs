using MediatR;
using MarketAdvanced.Catalog.Application.Common.Brands;

namespace MarketAdvanced.Catalog.Application.Commands.Brands.CreateBrand;

public sealed record CreateBrandCommand(int UserId, string Name, string Slug, string? Description) : IRequest<BrandResult>;
