using Microsoft.EntityFrameworkCore;
using MarketAdvanced.Identity.Domain;

namespace MarketAdvanced.Identity.Infrastructure;

public class IdentityDbContext: DbContext
{
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) {}
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshToken => Set<RefreshToken>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IdentityDbContext).Assembly);
    }
}