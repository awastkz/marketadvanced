using MarketAdvanced.Identity.Application.Contracts;
using MarketAdvanced.Identity.Domain;
using MarketAdvanced.Shared.Application.Exceptions;

public class GetUserHandler(IUserRepository repository)
{
    public async Task<User> getUser(GetUserQuery query)
    {
        var users = await repository.FindByIdAsync(query.id, null);
        return users;
    }
}