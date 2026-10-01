using MediatR;

namespace MarketAdvanced.Catalog.Application.Public.Products.GetPublicProduct;

/// <summary>Страница товара по slug. Неактивный товар — 404, как будто его нет.</summary>
public sealed record GetPublicProductQuery(string Slug) : IRequest<PublicProductDetails>;
