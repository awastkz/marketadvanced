using FluentValidation;

public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    private const long MaxSize = 5 * 1024 * 1024;
    private static readonly string[] AllowedExt = { ".jpg", ".jpeg", ".png" };

    public UpdateProfileCommandValidator()
    {
        // имена полей как в форме (Name/Surname), а не как в команде
        RuleFor(v => v.FirstName).MaximumLength(50).OverridePropertyName("Name");
        RuleFor(v => v.LastName).MaximumLength(50).OverridePropertyName("Surname");
        RuleFor(v => v.Email).EmailAddress();
        RuleFor(v => v.Phone).Matches(@"^\+7\d{10}$").WithMessage("Формат: +7XXXXXXXXXX");
        RuleFor(v => v.Gender).InclusiveBetween(1, 2);
        RuleFor(v => v.Avatar!)
            .Must(f => f.Content.Length > 0).WithMessage("Файл пустой")
            .Must(f => f.Content.Length <= MaxSize).WithMessage("Максимум 5 МБ")
            .Must(HaveAllowedExtension).WithMessage("Только jpg/png")
            .Must(BeRealImage).WithMessage("Файл не является изображением")
            .When(v => v.Avatar != null);
    }

    private static bool HaveAllowedExtension(UploadedFile f)
        => AllowedExt.Contains(Path.GetExtension(f.FileName).ToLowerInvariant());

    // читаем сигнатуру и возвращаем поток в начало: дальше его читает хендлер
    private static bool BeRealImage(UploadedFile f)
    {
        var s = f.Content;
        var start = s.Position;
        var h = new byte[4];
        var read = s.Read(h, 0, 4);
        s.Position = start;
        if (read < 4) return false;

        bool jpeg = h[0] == 0xFF && h[1] == 0xD8;
        bool png  = h[0] == 0x89 && h[1] == 0x50 && h[2] == 0x4E && h[3] == 0x47;
        return jpeg || png;
    }
}
