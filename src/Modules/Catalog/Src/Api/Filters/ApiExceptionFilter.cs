using MarketAdvanced.Catalog.Application.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MarketAdvanced.Catalog.Api.Filters;

/// <summary>Переводит исключения Application-слоя в ответы с телом { message }, как ждёт фронт.</summary>
public sealed class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var (status, message) = context.Exception switch
        {
            NotFoundException e => (StatusCodes.Status404NotFound, e.Message),
            ConflictException e => (StatusCodes.Status409Conflict, e.Message),
            _ => (0, string.Empty),
        };

        if (status == 0) return;

        context.Result = new ObjectResult(new { message }) { StatusCode = status };
        context.ExceptionHandled = true;
    }
}
