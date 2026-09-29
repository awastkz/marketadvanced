using MarketAdvanced.Identity.Domain;

namespace MarketAdvanced.Identity.Application.Contracts;

public interface IUserRepository
{
    Task<bool> ExistsByEmailAsync(string email);
    Task AddAsync(User user);
    Task<User> FindByEmailAsync(string email);
    Task<User> FindByIdAsync(Guid id, List<string>? ForeignEntities);
    Task<List<User>> FindByIdsAsync(List<Guid> ids);
    Task UpdateAsync(User user);
}