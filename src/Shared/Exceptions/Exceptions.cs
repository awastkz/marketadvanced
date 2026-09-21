namespace MarketAdvanced.Shared.Exceptions;

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

/// <summary>Нет ни пользователя, ни гостевого идентификатора: контроллер отвечает 401.</summary>
public sealed class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message) { }
}
