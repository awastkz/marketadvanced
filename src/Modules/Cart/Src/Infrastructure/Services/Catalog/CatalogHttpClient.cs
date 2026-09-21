using MarketAdvanced.Cart.Application.Services.Catalog;
using System.Net;
using System.Net.Http.Json;

namespace MarketAdvanced.Cart.Infrastructure.Services.Catalog;


public class CatalogHttpClient(HttpClient client) : ICatalogClient
{
    public async Task<ProductVariantDTO?> getProductAsync(int id, CancellationToken ct)
    {
        var response = await client.GetAsync($"api/variants/{id}", ct);
        if(response.StatusCode == HttpStatusCode.NotFound) return null;
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<ProductVariantDTO>(ct);
    }

    public async Task<IReadOnlyList<ProductVariantDTO>> getVariantsAsync(IReadOnlyCollection<int> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return [];

        var query = string.Join("&", ids.Select(i => $"ids={i}"));
        return await client.GetFromJsonAsync<List<ProductVariantDTO>>($"api/variants?{query}", ct) ?? [];
    }
}
