using MarketAdvanced.Cart.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MarketAdvanced.Cart.Infrastructure.Configurations;

public sealed class ShoppingCartConfiguration : IEntityTypeConfiguration<ShoppingCart>
{
    public void Configure(EntityTypeBuilder<ShoppingCart> builder)
    {
        builder.ToTable("ShoppingCart");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.UpdatedAt).IsRequired();

        // одна корзина на пользователя и одна на гостя; фильтр нужен, т.к. NULL в уникальном индексе не сравниваются
        builder.HasIndex(v => v.UserId).IsUnique().HasFilter("\"UserId\" IS NOT NULL");
        builder.HasIndex(v => v.GuestId).IsUnique().HasFilter("\"GuestId\" IS NOT NULL");

        builder.HasMany(v => v.Items)
            .WithOne()
            .HasForeignKey(v => v.CartId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
