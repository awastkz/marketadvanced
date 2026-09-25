using Amazon.S3;
using Amazon.S3.Model;
using MarketAdvanced.Shared.External.Options;
using Microsoft.Extensions.Options;

public sealed class S3AvatarStorage : IAvatarStorage
{
    private readonly IAmazonS3 _s3;
    private readonly MinioSettings _settings;

    public S3AvatarStorage(IAmazonS3 s3, IOptions<MinioSettings> settings)
    {
        _s3 = s3;
        _settings = settings.Value;
    }

    public async Task<string> UploadAsync(int userId, Stream content, string fileName, string contentType, CancellationToken ct = default)
    {
        var key = $"avatars/{userId}/{Guid.NewGuid()}{Path.GetExtension(fileName)}";

        await _s3.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _settings.Bucket,
            Key = key,
            InputStream = content,
            ContentType = contentType,
        }, ct);

        return key;
    }

    public Task DeleteAsync(string path, CancellationToken ct = default) =>
        _s3.DeleteObjectAsync(new DeleteObjectRequest
        {
            BucketName = _settings.Bucket,
            Key = path,
        }, ct);

    public string GetPublicUrl(string path) => $"{_settings.PublicEndpoint}/{_settings.Bucket}/{path}";
}
