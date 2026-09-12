using MarketAdvanced.Identity.Domain;

namespace MarketAdvanced.Identity.Application.Contracts;

public interface IUserRepository
{
    Task<bool> ExistsByEmailAsync(string email);
    Task AddAsync(User user);
    Task<User> findByEmailAsync(string email);
    Task<User> findByIdAsync(int id, List<string>? ForeignEntities);
    Task updateAsync(User user);
}