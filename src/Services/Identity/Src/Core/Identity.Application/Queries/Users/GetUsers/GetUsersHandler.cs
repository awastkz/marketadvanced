using MarketAdvanced.Identity.Application.Contracts;
using MarketAdvanced.Identity.Domain;
using MarketAdvanced.Shared.Application.Exceptions;

public class GetUsersHandler(IUserRepository repository)
{
    public async Task<List<User>> getUsers(GetUsersQuery query)
    {
        var users = await repository.FindByIdsAsync(query.Ids);
        if(users is null) throw new NotFoundException("404");

        return users;
    }
}