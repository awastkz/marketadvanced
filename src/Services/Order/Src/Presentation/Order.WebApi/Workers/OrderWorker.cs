using System.Threading.Channels;
using Amazon.Runtime.Internal.Util;
using MarketAdvanced.Order.Application.Common;
using MarketAdvanced.Order.Domain.Entities;
using MarketAdvanced.Order.Persistence;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace MarketAdvanced.Order.WebApi.Workers;
public class OrderWorker(
    Channel<Orders> channel,
    IServiceScopeFactory scopeFactory,
    ILogger<OrderWorker> logger
    ) : BackgroundService
{


    private const int BatchSize = 500;
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var batch = new List<Orders>(BatchSize);

        while(await channel.Reader.WaitToReadAsync(stoppingToken))
        {

            while(batch.Count < BatchSize && channel.Reader.TryRead(out var task))
            batch.Add(task);
            try
                {
                using var scope = scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
                db.Order.AddRange(batch);
                logger.LogInformation("Batching: {quantity}", batch.Count);
                await db.SaveChangesAsync(stoppingToken);
                }
                catch(OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
                catch(Exception e)
                {
                    logger.LogError(e, "Error for task Batching");
                }
                batch.Clear();
        }
    }
}