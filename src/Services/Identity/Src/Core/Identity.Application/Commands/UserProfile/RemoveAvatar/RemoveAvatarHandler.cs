using MarketAdvanced.Identity.Application.Contracts;
using MarketAdvanced.Identity.Domain;
using MediatR;

public sealed class RemoveAvatarHandler : IRequestHandler<RemoveAvatarCommand, ProfileResult>
{
    private readonly IUserRepository _userRepo;
    private readonly IAvatarStorage _storage;

    public RemoveAvatarHandler(IUserRepository userRepo, IAvatarStorage storage)
    {
        _userRepo = userRepo;
        _storage = storage;
    }

    public async Task<ProfileResult> Handle(RemoveAvatarCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepo.FindByIdAsync(request.UserId, new List<string> { "Profile" });
        user.Profile ??= new UserProfile { UserId = user.Id };

        var oldPath = user.Profile.AvatarPath;
        if (!string.IsNullOrEmpty(oldPath))
        {
            // сначала база, потом файл: сирота в хранилище безопаснее битой ссылки в профиле
            user.Profile.AvatarPath = null;
            await _userRepo.UpdateAsync(user);
            await _storage.DeleteAsync(oldPath, cancellationToken);
        }

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
