using FluentValidation;

namespace MarketAdvanced.Catalog.Application.Public.Products.SearchPublicProducts;

public sealed class SearchPublicProductsQueryValidator : AbstractValidator<SearchPublicProductsQuery>
{
    public const int MaxPageSize = 48;

    public SearchPublicProductsQueryValidator()
    {
        RuleFor(v => v.Page).GreaterThanOrEqualTo(1);
        // без верхней границы любой гость выгрузит весь каталог одним запросом
        RuleFor(v => v.PageSize).InclusiveBetween(1, MaxPageSize);
        RuleFor(v => v.Search).MaximumLength(100);
        RuleFor(v => v.Sort).IsInEnum();
    }
}
