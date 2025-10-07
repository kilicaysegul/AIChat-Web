using AIChat.API.Dtos;

namespace AIChat.API;

public interface IChatClient
{
    Task MessageReceived(MessageDto message);
}