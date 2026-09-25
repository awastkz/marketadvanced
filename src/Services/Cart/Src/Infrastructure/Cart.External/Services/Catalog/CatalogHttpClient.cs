using Amazon.Runtime.Internal.Util;
using MarketAdvanced.Cart.Application.Services.Catalog;
using MarketAdvanced.Shared.Application.Exceptions;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Http.Json;

namespace MarketAdvanced.Cart.External.Services.Catalog;


public class CatalogHttpClient(HttpClient client, ILogger<CatalogHttpClient> logger) : ICatalogClient
{
    public async Task<ProductVariantDTO?> getProductAsync(int id, CancellationToken ct)
    {
        var response = await SendAsync($"api/variants/{id}", ct);
        if(response.StatusCode == HttpStatusCode.NotFound) return null;
        await EnsureSuccess(response, ct);
        return await response.Content.ReadFromJsonAsync<ProductVariantDTO>(ct);
    }

    public async Task<IReadOnlyList<ProductVariantDTO>> getVariantsAsync(IReadOnlyCollection<int> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return [];

        var query = string.Join("&", ids.Select(i => $"ids={i}"));
        var response = await SendAsync($"api/variants?{query}", ct);

        await EnsureSuccess(response, ct);

        return await response.Content.ReadFromJsonAsync<List<ProductVariantDTO>>(ct) ?? [];
    }

    private async Task<HttpResponseMessage> SendAsync(string url, CancellationToken ct)
    {

        try
        {
           var response = await client.GetAsync(url, ct); 
           return response;
        }
        catch(HttpRequestException e)
        {
            logger.LogWarning(e, "Catalog недоступен", url);
            throw new ServiceUnavailableException("Каталог не доступен", e);
        }
        catch(TaskCanceledException e) when (!ct.IsCancellationRequested)
        {
            logger.LogWarning("Catalog не ответил за {Timeout}", client.Timeout.TotalSeconds, url);
            throw new ServiceUnavailableException("Сервис не ответил вовремя", e);
        }
    }

    private async Task EnsureSuccess(HttpResponseMessage response, CancellationToken ct)
    {
        if (response.IsSuccessStatusCode) return;
       
          var body = await response.Content.ReadAsStringAsync(ct);
          logger.LogError("Catalog ответил {Status} на {Url}: {Body}", (int)response.StatusCode, response.RequestMessage?.RequestUri, body);
          throw new ServiceUnavailableException("Каталог вернул ошибку");
    }
}
