using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Name).HasMaxLength(100).IsRequired();
        builder.Property(v => v.Slug).HasMaxLength(100).IsRequired();
        builder.HasIndex(v => v.Slug).IsUnique();
        builder.Property(v => v.Description).HasMaxLength(4000);
        builder.Property(v => v.ImagePath).HasMaxLength(500);
        builder.Property(v => v.CreatedAt).IsRequired();
        builder.Property(v => v.UserId).IsRequired();
        builder.HasIndex(v => v.UserId);
        builder.HasOne(v => v.Category).WithMany(v => v.Products).HasForeignKey(v => v.CategoryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(v => v.Brand).WithMany(v => v.Products).HasForeignKey(v => v.BrandId);
    }
}
