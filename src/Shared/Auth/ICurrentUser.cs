public interface ICurrentUser
{
    int Id {get;}
    bool IsAuthenticated {get;}
    Guid? GuestId {get;}
}