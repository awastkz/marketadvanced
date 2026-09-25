using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace MarketAdvanced.Host.Extensions;

/// <summary>
/// GroupName контроллера = модуль из имени сборки: Catalog.WebApi -> catalog. По нему OpenAPI делится на документ на сервис.
/// Явный [ApiExplorerSettings(GroupName = ...)] на контроллере не перетирается.
/// </summary>
public sealed class ModuleGroupNameConvention : IControllerModelConvention
{
    public void Apply(ControllerModel controller)
    {
        var name = controller.ControllerType.Assembly.GetName().Name!;
        if (name.EndsWith(".WebApi"))
            controller.ApiExplorer.GroupName ??= name[..^".WebApi".Length].ToLowerInvariant();
    }
}
