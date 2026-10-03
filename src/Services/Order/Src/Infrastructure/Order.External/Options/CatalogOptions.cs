using System.ComponentModel.DataAnnotations;

namespace MarketAdvanced.Order.External.Options;

public sealed class CatalogOptions
{
    [Required]
    [Url]
    public string BaseUrl {get;set;} = "";
}
