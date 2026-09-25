using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Persistence.Configurations;

public class VariantAttributeValueConfiguration : IEntityTypeConfiguration<VariantAttributeValue>
{
    public void Configure(EntityTypeBuilder<VariantAttributeValue> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Value).HasMaxLength(500).IsRequired();
        builder.HasIndex(v => new { v.ProductVariantId, v.AttributeId }).IsUnique();
        builder.HasOne(v => v.ProductVariant).WithMany(v => v.Attributes).HasForeignKey(v => v.ProductVariantId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(v => v.Attribute).WithMany(v => v.VariantValues).HasForeignKey(v => v.AttributeId).OnDelete(DeleteBehavior.Restrict);
    }
}
