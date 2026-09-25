using System.Text.Json;
using MarketAdvanced.Shared.Application.Exporter;
using Microsoft.AspNetCore.Authorization;

namespace MarketAdvanced.Catalog.WebApi.Admin.Export;

/// <summary>Админский экспорт таблиц в CSV: POST api/admin/export/{key}, тело — JSON фильтра.</summary>
[ApiController]
[Authorize]
[Route("api/admin/export")]
public sealed class ExportController : ControllerBase
{
    private readonly IEnumerable<ICsvExporter> _exporters;

    public ExportController(IEnumerable<ICsvExporter> exporters)
    {
        _exporters = exporters;
    }

    [HttpPost("{key}")]
    public async Task<IActionResult> Export(string key, [FromBody] JsonElement filters, CancellationToken ct)
    {
        var exporter = _exporters.FirstOrDefault(e => e.Key == key);
        if (exporter is null) return NotFound();

        Response.ContentType = "text/csv; charset=utf-8";
        Response.Headers.ContentDisposition = $"attachment; filename=\"{key}.csv\"";

        // после первой записи в Response.Body заголовки ушли: ошибка внутри уже не станет 500
        await exporter.ExportAsync(filters, Response.Body, ct);
        return new EmptyResult();
    }
}
