using FluentValidation;
using MarketAdvanced.Shared.Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.DependencyInjection;

namespace MarketAdvanced.Shared.WebApi.Filters;

/// <summary>Validation -> 400 (ValidationProblemDetails); NotFound -> 404, Conflict -> 409, Unauthorized -> 401, тело { message }, как ждёт фронт.</summary>
public sealed class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        // ValidationBehavior -> 400 ValidationProblemDetails, тот же формат, что давал AutoValidation
        if (context.Exception is ValidationException ve)
        {
            var modelState = new ModelStateDictionary();
            foreach (var error in ve.Errors) modelState.AddModelError(error.PropertyName, error.ErrorMessage);

            var factory = context.HttpContext.RequestServices.GetRequiredService<ProblemDetailsFactory>();
            var problem = factory.CreateValidationProblemDetails(context.HttpContext, modelState, StatusCodes.Status400BadRequest);

            context.Result = new ObjectResult(problem) { StatusCode = StatusCodes.Status400BadRequest };
            context.ExceptionHandled = true;
            return;
        }

        var (status, message) = context.Exception switch
        {
            NotFoundException e => (StatusCodes.Status404NotFound, e.Message),
            ConflictException e => (StatusCodes.Status409Conflict, e.Message),
            UnauthorizedException e => (StatusCodes.Status401Unauthorized, e.Message),
            ServiceUnavailableException e => (StatusCodes.Status503ServiceUnavailable, e.Message),
            _ => (0, string.Empty),
        };

        if (status == 0) return;

        context.Result = new ObjectResult(new { message }) { StatusCode = status };
        context.ExceptionHandled = true;
    }
}
