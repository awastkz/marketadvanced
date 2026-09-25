using System.ComponentModel.DataAnnotations;

namespace MarketAdvanced.Cart.External.Options;


public sealed class CatalogClientOptions
{
    [Required]
    [Url]
    public string BaseUrl {get;set;} = "";
}