public interface IAvatarStorage
{
    /// <summary>Загружает файл и возвращает ключ объекта (путь в бакете) для сохранения в профиле.</summary>
    Task<string> UploadAsync(Guid userId, Stream content, string fileName, string contentType, CancellationToken ct = default);

    Task DeleteAsync(string path, CancellationToken ct = default);

    string GetPublicUrl(string path);
}
