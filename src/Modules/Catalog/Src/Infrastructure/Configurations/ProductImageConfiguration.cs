using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Infrastructure.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.ImagePath).HasMaxLength(500).IsRequired();
        builder.Property(v => v.Alt).HasMaxLength(200);
        builder.Property(v => v.CreatedAt).IsRequired();
        builder.HasIndex(v => new { v.ProductId, v.SortOrder });
        builder.HasOne(v => v.Product).WithMany(v => v.Images).HasForeignKey(v => v.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(v => v.ProductVariant).WithMany(v => v.Images).HasForeignKey(v => v.ProductVariantId).OnDelete(DeleteBehavior.Cascade);
    }
}
