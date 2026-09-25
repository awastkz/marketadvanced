namespace MarketAdvanced.Catalog.Application.Abstractions;

public sealed record UploadedFile(Stream Content, string FileName, string ContentType);
