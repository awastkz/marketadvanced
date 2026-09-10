using System.Net;
using System.Net.Http.Json;
using MarketAdvanced.Api.DTO;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

public class AuthTests : IClassFixture<ApiEnvironmentFactory>
{
    private readonly HttpClient _client;
    
    public AuthTests(ApiEnvironmentFactory factory)
    {
        _client = factory.CreateClient();
    }

[Fact]
    public async Task RegisterUser_NotCorrect()
    {
        var request = new
        {
            Email = $"{Guid.NewGuid()}@test.local",
            Password = "123123123",
            RePassword = ""
        };
        
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);
        
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RegisterUser_Correct()
    {
        var request = new
        {
            Email = $"{Guid.NewGuid()}@test.local",
            Password = "123123123",
            RePassword = "123123123",
        };
        
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);
        
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task RegisterUser_Check_Duplicate()
    {
        var request = new
        {
            Email = $"{Guid.NewGuid()}@test.local",
            Password = "123123123",
            RePassword = "123123123"
        };
        
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        response = await _client.PostAsJsonAsync("/api/auth/register", request);
        
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

}