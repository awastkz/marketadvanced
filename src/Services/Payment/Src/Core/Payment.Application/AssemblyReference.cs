using System.Reflection;

namespace MarketAdvanced.Payment.Application;

/// <summary>Маркер сборки: по нему MediatR и FluentValidation находят handlers и валидаторы.</summary>
public static class AssemblyReference
{
    public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}
