using AIChat.API.Data;
using AIChat.API.Dtos;
using AIChat.API.Hubs;
using AIChat.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace AIChat.API.Services;

public class MessageService: IMessageService
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<AppUser> _users;
    private readonly ISentimentClient _sentiment;
    private readonly IHubContext<ChatHub, IChatClient> _hub;
    private readonly ICurrentUser _current;

    public MessageService(
        ApplicationDbContext db,
        UserManager<AppUser> users,
        ISentimentClient sentiment,
        IHubContext<ChatHub, IChatClient> hub,
        ICurrentUser current)
    {
        _db = db;
        _users = users;
        _sentiment = sentiment;
        _hub = hub;
        _current = current;
    }
    public async Task<MessageDto> SendAsync(string text)
    {
        // kimlik kontrolü
        if (!_current.IsAuthenticated || _current.Id == Guid.Empty)
            throw new UnauthorizedAccessException("Not authenticated.");

        text = (text ?? string.Empty).Trim();
        if (text.Length is < 1 or > 512)
            throw new ArgumentException("text length must be 1..512", nameof(text));

        var user = await _users.FindByIdAsync(_current.Id.ToString())
                   ?? throw new InvalidOperationException("User not found.");
        
        var label = await _sentiment.AnalyzeAsync(text); 

        var entity = new Message
        {
            UserId = _current.Id,
            UserName = _current.Name,
            Text = text,
            Sentiment = label,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Messages.Add(entity);
        await _db.SaveChangesAsync();

        var dto = new MessageDto
        {
            Id = entity.Id,
            CreatedAt = entity.CreatedAt,
            Text = entity.Text,
            UserName = entity.UserName,
            UserId = entity.UserId
        };
        
        await _hub.Clients.All.MessageReceived(dto);

        return dto;
    }

    public async Task<IReadOnlyList<MessageDto>> GetRecentAsync(DateTimeOffset? since, int take = 50)
    {
        take = Math.Clamp(take, 1, 200);

        var q = _db.Messages.AsNoTracking();

        if (since.HasValue)
            q = q.Where(m => m.CreatedAt > since.Value); 

        var list = await q.ToListAsync();

        var ordered = list
            .OrderBy(m => m.CreatedAt)    
            .Take(take)
            .Select(m => new MessageDto
            {
                Id = m.Id,
                CreatedAt = m.CreatedAt,
                Text = m.Text,
                UserName = m.UserName,
                UserId = m.UserId
            })
            .ToList();

        return ordered;
    }
}

