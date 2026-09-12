namespace MarketAdvanced.Identity.Contracts;

public interface IUserReader
{
    Task<UserDTO?> findByIdAsync(int Id, CancellationToken ct = default);
}