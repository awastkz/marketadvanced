using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;

namespace MarketAdvanced.Shared.External.HealthChecks;

/// <summary>
/// Одно соединение с RabbitMQ на процесс для health check. Если брокер был недоступен,
/// следующая проверка откроет соединение заново, а не вернёт закешированную ошибку.
/// </summary>
internal sealed class RabbitMqConnectionProvider(IConfiguration config)
{
    private Task<IConnection>? _connection;

    public Task<IConnection> GetAsync()
    {
        var current = _connection;
        if (current is { IsCompleted: false } || current is { IsCompletedSuccessfully: true, Result.IsOpen: true })
            return current;

        var s = config.GetSection("RabbitMQ");
        var factory = new ConnectionFactory
        {
            HostName = s["Host"] ?? "localhost",
            Port = int.TryParse(s["Port"], out var port) ? port : 5672,
            UserName = s["User"] ?? "guest",
            Password = s["Password"] ?? "guest",
            VirtualHost = s["VirtualHost"] ?? "/",
        };
        return _connection = factory.CreateConnectionAsync();
    }
}
