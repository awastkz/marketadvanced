using System.Net;
using System.Security.Claims;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UserProfileController: ControllerBase
{
    private readonly UserService _service;
  private readonly IAmazonS3 _s3;
  private readonly string _publicEndpoint;
  private readonly string _bucket;

  public UserProfileController(UserService service, IAmazonS3 s3, IConfiguration config)
  {
      _service = service;
      _s3 = s3;
      _publicEndpoint = config["Minio:PublicEndpoint"]!;   // http://localhost:9000
      _bucket = config["Minio:Bucket"]!;                   // marketadvanced
  }
    [HttpGet("index")]
    public async Task<IActionResult> index()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var user = await _service.getProfileAsync(userId);

        return Ok(ToResponse(user));
    }

    [HttpPost("update")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> update([FromForm] UserProfileRequest r)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        
        var user = await _service.updateProfile(userId, r);
        return Ok(ToResponse(user));
    }
    
    
    [HttpDelete("remove-avatar")]
    public async Task<IActionResult> removeAvatar()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        User user = new User();
        try
        {
            user = await _service.removeAvatarAsync(userId);
        }
        catch(Exception e)
        {
            return Conflict(new {e.Message});
        }

        return Ok(ToResponse(user));

    }

    private UserProfileResponse ToResponse(User user) => new(
        user.Id,
        user.Email,
        user.Profile.FirstName,
        user.Profile.LastName,
        user.Profile.Phone,
        user.Profile.Gender,
        string.IsNullOrEmpty(user.Profile.AvatarPath)
          ? null
          : $"{_publicEndpoint}/{_bucket}/{user.Profile.AvatarPath}"
    );
}