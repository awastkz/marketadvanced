using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Persistence.Configurations;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Sku).HasMaxLength(64).IsRequired();
        builder.HasIndex(v => v.Sku).IsUnique();
        builder.Property(v => v.Name).HasMaxLength(200);
        builder.Property(v => v.Price).HasPrecision(18, 2).IsRequired();
        builder.Property(v => v.CreatedAt).IsRequired();
        builder.HasOne(v => v.Product).WithMany(v => v.Variants).HasForeignKey(v => v.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}
