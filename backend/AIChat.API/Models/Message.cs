namespace AIChat.API.Models;

public class Message
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string UserName { get; set; } = default!;
    public string Text { get; set; } = default!;
    public string Sentiment { get; set; } = "neutral";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public AppUser? User { get; set; }
}