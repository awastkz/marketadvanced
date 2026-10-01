using Hangfire.Dashboard;

namespace MarketAdvanced.Host.Extensions;

/// <summary>Пускает в дашборд Hangfire всех. Только для dev, в проде нужна проверка роли admin.</summary>
public sealed class AllowAllDashboardFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) => true;
}
