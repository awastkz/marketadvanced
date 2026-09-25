# syntax=docker/dockerfile:1.7-labs
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# сначала только props и csproj (с сохранением путей), чтобы restore кэшировался
COPY Directory.Build.props Directory.Packages.props ./
COPY --parents **/*.csproj ./
RUN dotnet restore Host/Host.csproj

COPY . .
RUN dotnet publish Host/Host.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "Host.dll"]
