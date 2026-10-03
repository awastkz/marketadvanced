using MarketAdvanced.Order.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MarketAdvanced.Order.Persistence.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItems>
{
    public void Configure(EntityTypeBuilder<OrderItems> builder)
    {
        builder.ToTable("OrderItem");
        builder.HasKey(v => v.Id);

        // VariantId и ProductId без внешних ключей: товары живут в схеме catalog, а в будущем в другом сервисе
        builder.Property(v => v.VariantId).IsRequired();
        builder.Property(v => v.ProductId).IsRequired();

        // снимок на момент заказа, длины не меньше, чем в каталоге
        builder.Property(v => v.ProductName).HasMaxLength(200).IsRequired();
        builder.Property(v => v.VariantName).HasMaxLength(200);
        builder.Property(v => v.Sku).HasMaxLength(64).IsRequired();
        builder.Property(v => v.Price).HasPrecision(18, 2).IsRequired();
        builder.Property(v => v.Quantity).IsRequired();
    }
}
