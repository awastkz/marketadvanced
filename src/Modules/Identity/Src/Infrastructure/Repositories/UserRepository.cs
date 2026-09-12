using Microsoft.EntityFrameworkCore;
using MarketAdvanced.Identity.Domain;
using MarketAdvanced.Identity.Application.Contracts;

namespace MarketAdvanced.Identity.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IdentityDbContext _db;

    public UserRepository(IdentityDbContext db)
    {
        _db = db;
    }
    public async Task<bool> ExistsByEmailAsync(string email)
    {
        return await _db.Users.AnyAsync(x => x.Email == email);
    }

    public async Task AddAsync(User user)
    {
        await _db.AddAsync(user);
        await _db.SaveChangesAsync();
    }

    public async Task<User> findByEmailAsync(string email)
    {
        return await _db.Users.Where(v => v.Email == email).FirstOrDefaultAsync();
    }
    public async Task<User> findByIdAsync(int id, List<string>? ForeignEntites)
    {
        IQueryable<User> query = _db.Users.Where(v => v.Id == id);
        if(ForeignEntites is not null && ForeignEntites.Any())
        {
            foreach(string entity in ForeignEntites)
            {
                query = query.Include(entity);
            }
        }
        return await query.FirstAsync();
    }

    public async Task updateAsync(User user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }
}