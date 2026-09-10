using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Token).IsRequired().HasMaxLength(200);
        builder.Property(v => v.DeviceId).IsRequired().HasMaxLength(200);
        builder.Property(v => v.UserAgent).HasMaxLength(500);
        builder.Property(v => v.ExpiresAt).IsRequired();
        builder.Property(v => v.CreatedAt).IsRequired();
        builder.Property(v => v.IsRevoked).IsRequired();
        builder.HasIndex(v => v.UserId);
        builder.HasIndex(v => v.Token).IsUnique();
        builder.HasOne(v => v.User).WithMany(v => v.RefreshTokens).HasForeignKey(v => v.UserId);
    }
}