using Microsoft.Extensions.DependencyInjection;

public static class CurrentUserExtension
{
    public static IServiceCollection AddCurrentUser(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
services.AddScoped<ICurrentUser, HttpCurrentUser>();

return services;
    }
}