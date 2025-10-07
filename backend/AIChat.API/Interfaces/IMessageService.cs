using System.Security.Claims;
using AIChat.API.Dtos;

namespace AIChat.API;

public interface IMessageService
{
    Task<MessageDto> SendAsync(string text);                   
    Task<IReadOnlyList<MessageDto>> GetRecentAsync(DateTimeOffset? since, int take = 50); 
}