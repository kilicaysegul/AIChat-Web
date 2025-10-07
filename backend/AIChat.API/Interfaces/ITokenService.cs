using AIChat.API.Models;

namespace AIChat.API;

public interface ITokenService
{
    string CreateToken(AppUser user);
}