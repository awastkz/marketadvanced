using MarketAdvanced.Order.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MarketAdvanced.Order.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Orders>
{
    public void Configure(EntityTypeBuilder<Orders> builder)
    {
        // у заказа ровно один владелец: либо пользователь, либо гость
        builder.ToTable("Order", t => t.HasCheckConstraint(
            "CK_Order_Owner",
            "(\"UserId\" IS NOT NULL) <> (\"GuestId\" IS NOT NULL)"));
        builder.HasKey(v => v.Id);

        // номер выдаёт база: автоинкремент с 1000, вручную не задаётся
        builder.Property(v => v.Number)
            .UseIdentityAlwaysColumn()
            .HasIdentityOptions(startValue: 1000);
        builder.HasIndex(v => v.Number).IsUnique();

        builder.Property(v => v.Status).IsRequired();
        builder.Property(v => v.Total).HasPrecision(18, 2).IsRequired();
        builder.Property(v => v.CreatedAt).IsRequired();

        // UserId и GuestId без внешних ключей: пользователи живут в схеме identity, гость — это id из заголовка
        builder.HasIndex(v => v.UserId);
        builder.HasIndex(v => v.GuestId);

        builder.HasMany(v => v.Items)
            .WithOne(v => v.Order)
            .HasForeignKey(v => v.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
