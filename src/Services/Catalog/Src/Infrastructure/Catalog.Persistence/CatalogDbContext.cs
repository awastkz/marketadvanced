using MassTransit;
using Microsoft.EntityFrameworkCore;
using MarketAdvanced.Catalog.Domain;

namespace MarketAdvanced.Catalog.Persistence;

public class CatalogDbContext: DbContext
{
    public CatalogDbContext(DbContextOptions<CatalogDbContext> options) : base(options) {}
    public DbSet<Category> Category => Set<Category>();
    public DbSet<Product> Product => Set<Product>();
    public DbSet<ProductVariant> ProductVariant => Set<ProductVariant>();
    public DbSet<Brand> Brand => Set<Brand>();
    public DbSet<ProductImage> ProductImage => Set<ProductImage>();
    public DbSet<ProductAttribute> ProductAttribute => Set<ProductAttribute>();
    public DbSet<ProductAttributeValue> ProductAttributeValue => Set<ProductAttributeValue>();
    public DbSet<VariantAttributeValue> VariantAttributeValue => Set<VariantAttributeValue>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("catalog");
        // таблицы transactional outbox MassTransit, попадают в схему catalog
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CatalogDbContext).Assembly);
    }
}