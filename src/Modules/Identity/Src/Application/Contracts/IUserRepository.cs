namespace MarketAdvanced.Api.Contracts.Repositories;
public interface IUserRepository
{
    Task<bool> ExistsByEmailAsync(string email);
    Task AddAsync(User user);
    Task<User> findUserByEmailAsync(string email);
    Task<User> findByIdAsync(int id, List<string>? ForeignEntities);
    Task updateAsync(User user);
}