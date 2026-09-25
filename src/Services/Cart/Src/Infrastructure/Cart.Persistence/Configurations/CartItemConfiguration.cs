using MarketAdvanced.Cart.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MarketAdvanced.Cart.Persistence.Configurations;

public sealed class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("CartItem");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Quantity).IsRequired();

        // VariantId без внешнего ключа: варианты живут в схеме catalog, а в будущем в другом сервисе
        builder.Property(v => v.VariantId).IsRequired();
        builder.HasIndex(v => new { v.CartId, v.VariantId }).IsUnique();
    }
}
