using MarketAdvanced.Identity.Application.Contracts;
using MediatR;

public sealed class GetProfileHandler : IRequestHandler<GetProfileQuery, ProfileResult>
{
    private readonly IUserRepository _userRepo;

    public GetProfileHandler(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    public async Task<ProfileResult> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepo.FindByIdAsync(request.UserId, new List<string> { "Profile" });

        // у пользователей, зарегистрированных до появления профиля, его может не быть — отдаём пустые поля
        var profile = user.Profile;

        return new ProfileResult(
            user.Id,
            user.Email,
            profile?.FirstName,
            profile?.LastName,
            profile?.Phone,
            profile?.Gender,
            profile?.AvatarPath);
    }
}
