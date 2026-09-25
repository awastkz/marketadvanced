using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Persistence.Configurations;

public class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttribute>
{
    public void Configure(EntityTypeBuilder<ProductAttribute> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Name).HasMaxLength(100).IsRequired();
        builder.Property(v => v.Slug).HasMaxLength(100).IsRequired();
        builder.HasIndex(v => v.Slug).IsUnique();
        builder.Property(v => v.Unit).HasMaxLength(20);
        builder.Property(v => v.CreatedAt).IsRequired();
        builder.Property(v => v.UserId).IsRequired();
        builder.HasIndex(v => v.UserId);
    }
}
