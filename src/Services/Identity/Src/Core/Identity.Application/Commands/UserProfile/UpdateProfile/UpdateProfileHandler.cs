using MarketAdvanced.Identity.Application.Contracts;
using MarketAdvanced.Identity.Domain;
using MediatR;

public sealed class UpdateProfileHandler : IRequestHandler<UpdateProfileCommand, ProfileResult>
{
    private readonly IUserRepository _userRepo;
    private readonly IAvatarStorage _avatars;

    public UpdateProfileHandler(IUserRepository userRepo, IAvatarStorage avatars)
    {
        _userRepo = userRepo;
        _avatars = avatars;
    }

    public async Task<ProfileResult> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepo.FindByIdAsync(request.UserId, new List<string> { "Profile" });

        // у пользователей, зарегистрированных до появления профиля, строки может не быть
        user.Profile ??= new UserProfile { UserId = user.Id };

        user.Email = request.Email;
        user.Profile.FirstName = request.FirstName;
        user.Profile.LastName = request.LastName;
        user.Profile.Phone = request.Phone;
        user.Profile.Gender = request.Gender;

        if (request.Avatar is not null)
        {
            var oldPath = user.Profile.AvatarPath;
            var newPath = await _avatars.UploadAsync(
                user.Id,
                request.Avatar.Content,
                request.Avatar.FileName,
                request.Avatar.ContentType,
                cancellationToken);

            user.Profile.AvatarPath = newPath;

            if (!string.IsNullOrEmpty(oldPath))
                await _avatars.DeleteAsync(oldPath, cancellationToken);
        }

        await _userRepo.UpdateAsync(user);

        return new ProfileResult(
            user.Id,
            user.Email,
            user.Profile.FirstName,
            user.Profile.LastName,
            user.Profile.Phone,
            user.Profile.Gender,
            user.Profile.AvatarPath);
    }
}
