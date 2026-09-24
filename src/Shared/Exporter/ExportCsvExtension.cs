using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Shared.Exporter;

public static class ExportCsvExtension
{
    /// <summary>Простой экспорт всей таблицы без фильтра.</summary>
    public static IServiceCollection AddExport<TEntity, TDb>(this IServiceCollection s, string key)
        where TEntity : class
        where TDb : DbContext =>
        s.AddExport<TEntity, ExportFilter, TDb>(key);

    /// <summary>Экспорт с фильтром, но без своей логики: ApplyFilter останется no-op, пока нет наследника.</summary>
    public static IServiceCollection AddExport<TEntity, TFilter, TDb>(this IServiceCollection s, string key)
        where TEntity : class
        where TFilter : ExportFilter, new()
        where TDb : DbContext =>
        s.AddScoped<ICsvExporter>(sp => new EntityExporter<TEntity, TFilter>(sp.GetRequiredService<TDb>(), key));

    /// <summary>Экспорт со своим наследником EntityExporter, где переопределён ApplyFilter.</summary>
    public static IServiceCollection AddExport<TExporter>(this IServiceCollection s)
        where TExporter : class, ICsvExporter =>
        s.AddScoped<ICsvExporter, TExporter>();
}
