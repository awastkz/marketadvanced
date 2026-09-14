namespace MarketAdvanced.Catalog.Application.Common;

/// <summary>Сущность не найдена: контроллер отвечает 404.</summary>
public sealed class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

/// <summary>Нарушение бизнес-правила или уникальности: контроллер отвечает 409.</summary>
public sealed class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}
