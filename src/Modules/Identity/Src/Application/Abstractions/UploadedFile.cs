/// <summary>Файл, пришедший в команду. Не зависит от ASP.NET (IFormFile).</summary>
public sealed record UploadedFile(Stream Content, string FileName, string ContentType);
