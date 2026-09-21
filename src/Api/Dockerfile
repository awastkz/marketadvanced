FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# сначала только csproj, чтобы restore кэшировался
COPY Api/api.csproj Api/
COPY Shared/Shared.csproj Shared/
COPY Modules/Identity/Src/Identity.csproj Modules/Identity/Src/
RUN dotnet restore Api/api.csproj

COPY . .
RUN dotnet publish Api/api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "api.dll"]
