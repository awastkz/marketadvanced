using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;

namespace MarketAdvanced.Identity.WebApi.Profile;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UserProfileController: ControllerBase
{
  private readonly IMediator _mediator;
  private readonly IAvatarStorage _storage;

  public UserProfileController(IMediator mediator, IAvatarStorage storage)
  {
      _mediator = mediator;
      _storage = storage;
  }
    [HttpGet("index")]
    public async Task<IActionResult> index()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _mediator.Send(new GetProfileQuery(userId));

        return Ok(ToResponse(result));
    }

    [HttpPost("update")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> update([FromForm] UserProfileRequest r)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        
        var avatar = r.Avatar is null
            ? null
            : new UploadedFile(r.Avatar.OpenReadStream(), r.Avatar.FileName, r.Avatar.ContentType);

        var result = await _mediator.Send(new UpdateProfileCommand(
            userId, r.Email, r.Name, r.Surname, r.Phone, r.Gender, avatar));

        return Ok(ToResponse(result));
    }
    
    
    [HttpDelete("remove-avatar")]
    public async Task<IActionResult> removeAvatar()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var result = await _mediator.Send(new RemoveAvatarCommand(userId));

        return Ok(ToResponse(result));

    }

    private UserProfileResponse ToResponse(ProfileResult r) => new(
        r.Id,
        r.Email,
        r.FirstName,
        r.LastName,
        r.Phone,
        r.Gender,
        string.IsNullOrEmpty(r.AvatarPath) ? null : _storage.GetPublicUrl(r.AvatarPath)
    );
}
