using Microsoft.EntityFrameworkCore;
using MarketAdvanced.Identity.Domain;
using MarketAdvanced.Identity.Application.Contracts;

namespace MarketAdvanced.Identity.Infrastructure.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly IdentityDbContext _db;

    public RefreshTokenRepository(IdentityDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(RefreshToken refreshToken)
    {
        await _db.AddAsync(refreshToken);
        await _db.SaveChangesAsync();
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        return await _db.RefreshToken.Where(v => v.Token == token).FirstOrDefaultAsync();
    }

    public async Task UpdateAsync(RefreshToken refreshToken)
    {
        _db.Update(refreshToken);
        await _db.SaveChangesAsync();
    }
}