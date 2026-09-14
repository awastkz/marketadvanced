using Amazon.S3;
using MarketAdvanced.Shared.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

public static class S3ServiceExtension
{
    public static IServiceCollection AddS3Storage(
        this IServiceCollection services, IConfiguration config
    )
    {
        services.Configure<MinioSettings>(config.GetSection("Minio"));
        services.AddSingleton<IAmazonS3>(sp =>
        {
            var o = sp.GetRequiredService<IOptions<MinioSettings>>().Value;
            return new AmazonS3Client(o.AccessKey, o.SecretKey, new AmazonS3Config
            {
                ServiceURL = o.InternalEndpoint,
                ForcePathStyle = true,
            });
        });

        return services;
    }
}