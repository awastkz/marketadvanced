using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.FirstName).HasMaxLength(100);
        builder.Property(v => v.LastName).HasMaxLength(100);
        builder.Property(v => v.Phone).HasMaxLength(30);
        builder.HasIndex(x => x.UserId).IsUnique();
        builder.HasOne(v => v.User).WithOne(v => v.Profile).HasForeignKey<UserProfile>(v => v.UserId);
    }
}