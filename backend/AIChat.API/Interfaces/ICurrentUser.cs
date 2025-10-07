using System.Security.Claims;

namespace AIChat.API;

public interface ICurrentUser
{
    bool IsAuthenticated { get; }
    Guid Id { get; }             
    string? Name { get; }
}