using Amazon.S3;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NSubstitute;
using Testcontainers.PostgreSql;

namespace MarketAdvanced.Shared.Testing;

/// <summary>
/// Общая фабрика для интеграционных тестов модулей: поднимает Postgres в контейнере,
/// подменяет внешние сервисы. Какой DbContext мигрировать, решает наследник в модуле.
/// </summary>
public abstract class TestEnvironmentFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _db = new PostgreSqlBuilder("postgres:17-alpine").Build();

    protected abstract Task MigrateAsync(IServiceProvider services);

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:Postgres", _db.GetConnectionString());

        // секции Minio нет в appsettings.Development.json,
        // а AmazonS3Client создаётся при старте приложения
        builder.UseSetting("Minio:InternalEndpoint", "http://localhost:9000");
        builder.UseSetting("Minio:PublicEndpoint", "http://localhost:9000");
        builder.UseSetting("Minio:AccessKey", "test");
        builder.UseSetting("Minio:SecretKey", "test");
        builder.UseSetting("Minio:Bucket", "test");

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IAmazonS3>();
            services.AddSingleton(Substitute.For<IAmazonS3>());
        });
    }

    public async Task InitializeAsync()
    {
        await _db.StartAsync();
        using var scope = Services.CreateScope();
        await MigrateAsync(scope.ServiceProvider);
    }

    public new async Task DisposeAsync()
    {
        await base.DisposeAsync();
        await _db.DisposeAsync();
    }
}
