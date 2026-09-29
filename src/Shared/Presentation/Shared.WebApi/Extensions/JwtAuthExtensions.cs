using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace MarketAdvanced.Shared.WebApi.Extensions;

public static class JwtAuthExtensions
{
    // Имена схем аутентификации. По ним схемы регистрируются и по ним же выбираются ниже
    private const string LegacyScheme = "Legacy";
    private const string KeycloakScheme = "Keycloak";

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
    {
        // Адрес realm в Keycloak, например http://localhost:8180/realms/marketadvanced.
        // Keycloak пишет его в поле iss каждого токена, по нему узнаём «свои» токены
        var keycloakIssuer = config["Keycloak:Issuer"];

        // Включаем аутентификацию. По умолчанию используется схема с именем "Bearer"
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)

            // Схема "Bearer" сама ничего не проверяет, она только решает,
            // куда отправить токен: в "Legacy" или в "Keycloak".
            // Это временно, пока фронт ещё логинится через старый AuthController
            .AddPolicyScheme(JwtBearerDefaults.AuthenticationScheme, "Legacy или Keycloak", o =>
            {
                // Эта функция вызывается на каждый запрос и возвращает имя схемы
                o.ForwardDefaultSelector = ctx =>
                {
                    // Берём заголовок Authorization из запроса
                    var header = ctx.Request.Headers.Authorization.ToString();

                    // Проверяем, что он начинается с "Bearer "
                    if (header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                    {
                        // Отрезаем "Bearer ", остаётся сам токен
                        var token = header["Bearer ".Length..];

                        // Инструмент для чтения JWT (без проверки подписи, просто прочитать).
                        // Подпись проверит уже выбранная схема
                        var handler = new JsonWebTokenHandler();

                        // Если это JWT и поле iss равно адресу Keycloak, отправляем в "Keycloak"
                        if (handler.CanReadToken(token) && handler.ReadJsonWebToken(token).Issuer == keycloakIssuer)
                            return KeycloakScheme;
                    }

                    // Во всех остальных случаях (старый токен или токена нет) отправляем в "Legacy"
                    return LegacyScheme;
                };
            })

            // Схема "Legacy": проверка старых токенов, которые выдаёт само приложение (TokenService).
            // Удалить вместе с AuthController после перехода фронта на Keycloak
            .AddJwtBearer(LegacyScheme, options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    // Проверять, кто выдал токен (поле iss)
                    ValidateIssuer = true,

                    // Проверять, для кого выдан токен (поле aud)
                    ValidateAudience = true,

                    // Проверять срок жизни (поле exp)
                    ValidateLifetime = true,

                    // Проверять подпись токена
                    ValidateIssuerSigningKey = true,

                    // Ожидаемые значения iss и aud из appsettings, секция Jwt
                    ValidIssuer = config["Jwt:Issuer"],
                    ValidAudience = config["Jwt:Audience"],

                    // Общий секретный ключ: им TokenService подписывает токены, им же проверяем
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(config["Jwt:Key"]!))
                };
            })

            // Схема "Keycloak": проверка токенов из Keycloak
            .AddJwtBearer(KeycloakScheme, options =>
            {
                // Адрес realm в Keycloak, от него ожидаем токены.
                // По нему же скачиваются публичные ключи для проверки подписи, общий секрет не нужен
                options.Authority = keycloakIssuer;

                // Откуда скачать настройки Keycloak (публичные ключи и т.д.).
                // Нужно для Docker, там Keycloak доступен по другому адресу (keycloak:8080).
                // Если не задано, адрес строится из Authority
                options.MetadataAddress = config["Keycloak:MetadataAddress"];

                // Токен должен быть выдан для нашего API (поле aud).
                // В Keycloak это добавляет Audience mapper у клиента
                options.Audience = config["Keycloak:Audience"];

                // Разрешаем http без https. По умолчанию true, false только в appsettings.Development.json
                options.RequireHttpsMetadata = config.GetValue("Keycloak:RequireHttpsMetadata", true);

                // Не переименовывать поля токена, оставить как есть: sub, roles, email.
                // Без этого .NET переименует sub в длинный ClaimTypes.NameIdentifier и т.п.
                options.MapInboundClaims = false;

                // User.Identity.Name будет браться из поля preferred_username
                options.TokenValidationParameters.NameClaimType = "preferred_username";

                // Роли для [Authorize(Roles = "...")] берутся из поля roles.
                // В Keycloak его заполняет mapper "User Client Role" с Token Claim Name = roles
                options.TokenValidationParameters.RoleClaimType = "roles";
            });

        // Включаем авторизацию, чтобы работали [Authorize] и роли
        services.AddAuthorization();

        // Возвращаем services, чтобы можно было вызывать дальше цепочкой
        return services;
    }
}
