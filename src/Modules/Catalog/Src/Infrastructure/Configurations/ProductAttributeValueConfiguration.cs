using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Infrastructure.Configurations;

public class ProductAttributeValueConfiguration : IEntityTypeConfiguration<ProductAttributeValue>
{
    public void Configure(EntityTypeBuilder<ProductAttributeValue> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Value).HasMaxLength(500).IsRequired();
        builder.HasIndex(v => new { v.ProductId, v.AttributeId }).IsUnique();
        builder.HasOne(v => v.Product).WithMany(v => v.Attributes).HasForeignKey(v => v.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(v => v.Attribute).WithMany(v => v.Values).HasForeignKey(v => v.AttributeId).OnDelete(DeleteBehavior.Restrict);
    }
}
