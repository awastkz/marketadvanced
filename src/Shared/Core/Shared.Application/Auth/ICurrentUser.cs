public interface ICurrentUser
{
    Guid Id {get;}
    bool IsAuthenticated {get;}
    Guid? GuestId {get;}
}