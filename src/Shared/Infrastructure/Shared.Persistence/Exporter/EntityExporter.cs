using CsvHelper;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Reflection;
using System.Text;
using System.Text.Json;
using MarketAdvanced.Shared.Application.Exporter;

namespace MarketAdvanced.Shared.Persistence.Exporter;

public class ExportFilter { }

[AttributeUsage(AttributeTargets.Property)]
public class ExportIgnoreAttribute : Attribute { }

public class EntityExporter<TEntity, TFilter>(DbContext db, string dbEntityName) : ICsvExporter
    where TEntity : class
    where TFilter : ExportFilter, new()
{
    public string Key => dbEntityName;

    /// <summary>Точка расширения: наследник накладывает условия из фильтра. По умолчанию без фильтрации.</summary>
    public virtual IQueryable<TEntity> ApplyFilter(IQueryable<TEntity> q, TFilter f) => q;

    public async Task ExportAsync(JsonElement filters, Stream output, CancellationToken ct)
    {
        var entityType = db.Model.FindEntityType(typeof(TEntity))
            ?? throw new InvalidOperationException($"{typeof(TEntity).Name} не замаплен в {db.GetType().Name}.");

        // скалярные свойства с CLR-полем, без [ExportIgnore]; навигации и shadow-свойства не попадают
        var props = entityType.GetProperties()
            .Select(p => p.PropertyInfo)
            .Where(p => p is not null && !p.IsDefined(typeof(ExportIgnoreAttribute)))
            .Select(p => p!)
            .ToList();

        var filter = filters.ValueKind is JsonValueKind.Object
            ? JsonSerializer.Deserialize<TFilter>(filters, JsonSerializerOptions.Web) ?? new TFilter()
            : new TFilter();

        var query = ApplyFilter(db.Set<TEntity>().AsNoTracking(), filter);

        // leaveOpen: поток принадлежит вызывающему (Response.Body, MemoryStream)
        await using var writer = new StreamWriter(output, new UTF8Encoding(true), leaveOpen: true);
        await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        foreach (var prop in props) csv.WriteField(prop.Name);
        await csv.NextRecordAsync();

        await foreach (var row in query.AsAsyncEnumerable().WithCancellation(ct))
        {
            foreach (var prop in props) csv.WriteField(prop.GetValue(row));
            await csv.NextRecordAsync();
        }

        await csv.FlushAsync();
    }
}
