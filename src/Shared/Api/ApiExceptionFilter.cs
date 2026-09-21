using MarketAdvanced.Shared.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MarketAdvanced.Shared.Api;

/// <summary>NotFound -> 404, Conflict -> 409, Unauthorized -> 401, тело { message }, как ждёт фронт.</summary>
public sealed class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var (status, message) = context.Exception switch
        {
            NotFoundException e => (StatusCodes.Status404NotFound, e.Message),
            ConflictException e => (StatusCodes.Status409Conflict, e.Message),
            UnauthorizedException e => (StatusCodes.Status401Unauthorized, e.Message),
            _ => (0, string.Empty),
        };

        if (status == 0) return;

        context.Result = new ObjectResult(new { message }) { StatusCode = status };
        context.ExceptionHandled = true;
    }
}
