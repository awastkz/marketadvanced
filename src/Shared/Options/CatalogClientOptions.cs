using System.ComponentModel.DataAnnotations;

namespace MarketAdvanced.Shared.Options;


public sealed class CatalogClientOptions
{
    [Required]
    [Url]
    public string BaseUrl {get;set;} = "";
}