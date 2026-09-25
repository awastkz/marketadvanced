using System.ComponentModel.DataAnnotations;

namespace MarketAdvanced.Shared.External.Options;

/// <summary>Секция RabbitMQ: подключение к брокеру для MassTransit.</summary>
public sealed class RabbitMqSettings
{
    [Required]
    public string Host { get; set; } = "";
    public ushort Port { get; set; } = 5672;
    [Required]
    public string User { get; set; } = "";
    [Required]
    public string Password { get; set; } = "";
    public string VirtualHost { get; set; } = "/";
}
