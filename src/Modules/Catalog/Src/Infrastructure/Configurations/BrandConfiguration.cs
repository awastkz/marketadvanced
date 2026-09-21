using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Infrastructure.Configurations;

public class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Name).HasMaxLength(100).IsRequired();
        builder.Property(v => v.Slug).HasMaxLength(100).IsRequired();
        builder.HasIndex(v => v.Slug).IsUnique();
        builder.Property(v => v.Description).HasMaxLength(2000);
        builder.Property(v => v.LogoPath).HasMaxLength(500);
        builder.Property(v => v.CreatedAt).IsRequired();
        builder.Property(v => v.UserId).IsRequired();
        builder.HasIndex(v => v.UserId);
        builder.HasMany(v => v.Products).WithOne(v => v.Brand).HasForeignKey(v => v.BrandId).OnDelete(DeleteBehavior.SetNull);
    }
}
