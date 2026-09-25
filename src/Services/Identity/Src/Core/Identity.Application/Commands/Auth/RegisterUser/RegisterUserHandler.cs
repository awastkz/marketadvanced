using MarketAdvanced.Identity.Application.Contracts;
using MarketAdvanced.Identity.Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, RegisterUserResult>
{
    private readonly IUserRepository _userRepo;

    public RegisterUserHandler(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    public async Task<RegisterUserResult> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        if(await _userRepo.ExistsByEmailAsync(request.Email))
        {
            throw new Exception("Email already exists");
        }

        var user = new User
        {
            Email = request.Email,
            Profile = new UserProfile(),
        };

        var hasher = new PasswordHasher<User>();
        user.PasswordHash = hasher.HashPassword(user, request.Password);

        await _userRepo.AddAsync(user);

        return new RegisterUserResult(user);
    }
}