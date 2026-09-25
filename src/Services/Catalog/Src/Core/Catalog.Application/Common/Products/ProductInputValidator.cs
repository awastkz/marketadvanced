using FluentValidation;

namespace MarketAdvanced.Catalog.Application.Common.Products;

/// <summary>Правила товара, общие для CreateProductCommand и UpdateProductCommand.</summary>
public abstract class ProductInputValidator<T> : AbstractValidator<T> where T : IProductInput
{
    protected ProductInputValidator()
    {
        RuleFor(v => v.Name).NotEmpty().MaximumLength(100);
        RuleFor(v => v.Slug).NotEmpty().MaximumLength(100)
            .Matches("^[a-z0-9-]+$").WithMessage("Только латиница, цифры и дефис");
        RuleFor(v => v.Description).MaximumLength(4000);
        RuleFor(v => v.CategoryId).GreaterThan(0);
        RuleFor(v => v.BrandId).GreaterThan(0).When(v => v.BrandId.HasValue);

        RuleFor(v => v.Variants).NotEmpty().WithMessage("Нужен хотя бы один вариант");
        RuleForEach(v => v.Variants).SetValidator(new VariantInputValidator());
        RuleFor(v => v.Variants)
            .Must(HaveUniqueSkus).WithMessage("SKU повторяются")
            .Must(HaveUniqueVariantCombos).WithMessage("Одинаковые сочетания признаков у вариантов");

        RuleForEach(v => v.Attributes).SetValidator(new AttributeValueInputValidator());
        RuleFor(v => v.Attributes)
            .Must(HaveUniqueAttributes).WithMessage("Атрибут указан дважды");

        RuleFor(v => v)
            .Must(v => !ProductAndVariantAttributesOverlap(v))
            .WithMessage("Атрибут не может быть одновременно характеристикой товара и признаком варианта");
    }

    private static bool HaveUniqueSkus(IReadOnlyList<VariantInput> variants)
        => variants.Select(v => v.Sku.Trim().ToLowerInvariant()).Distinct().Count() == variants.Count;

    private static bool HaveUniqueAttributes(IReadOnlyList<AttributeValueInput> attributes)
        => attributes.Select(a => a.AttributeId).Distinct().Count() == attributes.Count;

    // если признаки заданы, сочетание значений у каждого варианта должно быть своим
    private static bool HaveUniqueVariantCombos(IReadOnlyList<VariantInput> variants)
    {
        var withAxes = variants.Where(v => v.Attributes.Count > 0).ToList();
        if (withAxes.Count == 0) return true;

        var keys = withAxes.Select(v => string.Join("|",
            v.Attributes.OrderBy(a => a.AttributeId).Select(a => $"{a.AttributeId}={a.Value.Trim().ToLowerInvariant()}")));
        return keys.Distinct().Count() == withAxes.Count;
    }

    private static bool ProductAndVariantAttributesOverlap(T r)
    {
        var product = r.Attributes.Select(a => a.AttributeId).ToHashSet();
        return r.Variants.SelectMany(v => v.Attributes).Any(a => product.Contains(a.AttributeId));
    }
}

public sealed class VariantInputValidator : AbstractValidator<VariantInput>
{
    public VariantInputValidator()
    {
        RuleFor(v => v.Sku).NotEmpty().MaximumLength(64);
        RuleFor(v => v.Name).MaximumLength(200);
        RuleFor(v => v.Price).GreaterThan(0);
        RuleFor(v => v.Stock).GreaterThanOrEqualTo(0);
        RuleForEach(v => v.Attributes).SetValidator(new AttributeValueInputValidator());
        RuleFor(v => v.Attributes)
            .Must(a => a.Select(x => x.AttributeId).Distinct().Count() == a.Count)
            .WithMessage("Признак указан дважды");
    }
}

public sealed class AttributeValueInputValidator : AbstractValidator<AttributeValueInput>
{
    public AttributeValueInputValidator()
    {
        RuleFor(v => v.AttributeId).GreaterThan(0);
        RuleFor(v => v.Value).NotEmpty().MaximumLength(500);
    }
}
