using FluentValidation;
using MarketAdvanced.Identity.Api.Requests;

namespace MarketAdvanced.Identity.Api.Validators;

public class UserProfileValidator: AbstractValidator<UserProfileRequest>
{
    private const long MaxSize = 5 * 1024 * 1024;
    private static readonly string[] AllowedExt = { ".jpg", ".jpeg", ".png" };

    public UserProfileValidator()
    {
        RuleFor(v => v.Name).MaximumLength(50);
        RuleFor(v => v.Surname).MaximumLength(50);
        RuleFor(v => v.Email).EmailAddress();
        RuleFor(v => v.Phone).Matches(@"^\+7\d{10}$").WithMessage("Формат: +7XXXXXXXXXX");
        RuleFor(v => v.Gender).InclusiveBetween(1,2);
        RuleFor(f => f.Avatar)
        .Must(f => f.Length > 0).WithMessage("Файл пустой")
        .Must(f => f.Length <= MaxSize).WithMessage("Максимум 5 МБ")
        .Must(HaveAllowedExtension).WithMessage("Только jpg/png")
        .Must(BeRealImage).WithMessage("Файл не является изображением")
        .When(f => f.Avatar != null);
    }

    private bool HaveAllowedExtension(IFormFile f)
        => AllowedExt.Contains(Path.GetExtension(f.FileName).ToLowerInvariant());

    private bool BeRealImage(IFormFile f)
    {
        using var s = f.OpenReadStream();
        var h = new byte[4];
        if (s.Read(h, 0, 4) < 4) return false;

        bool jpeg = h[0] == 0xFF && h[1] == 0xD8;
        bool png  = h[0] == 0x89 && h[1] == 0x50 && h[2] == 0x4E && h[3] == 0x47;
        return jpeg || png;
    }

}