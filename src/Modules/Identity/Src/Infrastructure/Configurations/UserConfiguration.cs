using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Email).IsRequired().HasMaxLength(255);
        builder.HasIndex(v => v.Email).IsUnique();
        builder.Property(v => v.PasswordHash).IsRequired().HasMaxLength(255);
        builder.Property(v => v.CreatedAt).IsRequired();
    }
}