using System.ComponentModel.DataAnnotations;

namespace MarketAdvanced.Shared.External.Options;


public sealed class CatalogClientOptions
{
    [Required]
    [Url]
    public string BaseUrl {get;set;} = "";
}