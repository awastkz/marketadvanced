using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Infrastructure.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Name).HasMaxLength(100).IsRequired();
        builder.Property(v => v.Slug).HasMaxLength(100).IsRequired();
        builder.HasIndex(v => v.Slug).IsUnique();
        builder.Property(v => v.ImagePath).HasMaxLength(500);
        builder.Property(v => v.CreatedAt).IsRequired();
        builder.HasOne(v => v.Parent).WithMany(v => v.Children).HasForeignKey(v => v.ParentId).OnDelete(DeleteBehavior.Restrict);
    }
}
