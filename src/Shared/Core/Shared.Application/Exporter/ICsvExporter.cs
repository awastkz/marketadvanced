using System.Text.Json;

namespace MarketAdvanced.Shared.Application.Exporter;

public interface ICsvExporter
{
    string Key { get; }
    Task ExportAsync(JsonElement filters, Stream output, CancellationToken ct);
}
