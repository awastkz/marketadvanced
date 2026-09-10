using System.Net;
using System.Security.Claims;
using Amazon.S3;
using Amazon.S3.Model;
using MarketAdvanced.Api.Contracts.Repositories;

public class UserService
{
    private readonly IUserRepository _userRepo;
    private readonly IConfiguration _config;
    private readonly IAmazonS3 _s3;

    public UserService(IUserRepository userRepo, IConfiguration config, IAmazonS3 s3)
    {
        _userRepo = userRepo;
        _config = config;
        _s3 = s3;
    }

    public async Task<User> getByIdAsync(int id, List<string>? entities)
    {
        return await _userRepo.findByIdAsync(id, entities);
    }

    public async Task<User> getProfileAsync(int userId)
    {
        var user = await _userRepo.findByIdAsync(userId, new List<string> {"Profile"});
        if (user.Profile is null)
        {
            user.Profile = new UserProfile { UserId = user.Id };
            await _userRepo.updateAsync(user);
        }
        return user;
    }

    public async Task<User> updateProfile(int userId, UserProfileRequest r)
    {
        var user = await getProfileAsync(userId);
        user.Profile.FirstName = r.Name;
        user.Profile.LastName = r.Surname;
        user.Profile.Phone = r.Phone;
        user.Email = r.Email;
        user.Profile.Gender = r.Gender;
        
        string? AvatarKey = user.Profile.AvatarPath;
        
        if(r.Avatar is not null)
        {
            var newAvatarKey = $"avatars/{userId}/{Guid.NewGuid()}{Path.GetExtension(r.Avatar.FileName)}";
            var avatar = await _s3.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _config["Minio:Bucket"],
            Key = newAvatarKey,
            InputStream = r.Avatar.OpenReadStream(),
            ContentType = r.Avatar.ContentType,
        });

        if(avatar.HttpStatusCode == HttpStatusCode.OK)
            {
                if (!string.IsNullOrEmpty(AvatarKey))
                {
                    await _s3.DeleteObjectAsync(new DeleteObjectRequest
                    {
                        BucketName = _config["Minio:Bucket"],
                        Key = AvatarKey,
                    });
                }
                AvatarKey = newAvatarKey;
            }
        }

        user.Profile.AvatarPath = AvatarKey;

        await _userRepo.updateAsync(user);
        return user;
    }

    public async Task<User> removeAvatarAsync(int userId)
    {
        var user = await this.getProfileAsync(userId);
        await _s3.DeleteObjectAsync(new DeleteObjectRequest
        {
            BucketName = _config["Minio:Bucket"],
            Key = user.Profile.AvatarPath
        });
        user.Profile.AvatarPath = null;
        await this.saveAsync(user);

        return user;
    }

    public async Task saveAsync(User user)
    {
        await _userRepo.updateAsync(user);
    }
}
