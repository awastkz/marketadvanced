using MarketAdvanced.Identity.Contracts;
using MarketAdvanced.Identity.Application.Contracts;

namespace MarketAdvanced.Identity.PublicApi;

public class UserReader : IUserReader
{
    private readonly IUserRepository _users;

    public UserReader(IUserRepository users)
    {
        _users = users;
    }

    public async Task<UserDTO?> findByIdAsync(int Id, CancellationToken ct = default)
    {
        var user = await _users.findByIdAsync(Id, null);
        return user is null ? null : new UserDTO(user.Id, user.Email);
    }
}
