namespace MarketAdvanced.Cart.Domain;

public sealed record CartOwner
{
    public int? UserId {get;}
    public Guid? GuestId {get;}
    private CartOwner(int? userId, Guid? guestId) => (UserId, GuestId) = (userId, guestId);
    public static CartOwner User(int id) => new (id, null);
    public static CartOwner Guest(Guid id) => new (null, id);
    public bool isGuest => UserId is null;
}