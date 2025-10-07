using System.Security.Claims;

namespace AIChat.API.Services;

public class CurrentUser: ICurrentUser
{
    private readonly IHttpContextAccessor _http;
    public CurrentUser(IHttpContextAccessor http) => _http = http;

    public bool IsAuthenticated =>
        _http.HttpContext?.User?.Identity?.IsAuthenticated == true;

    public Guid Id
    {
        get
        {
            var user = _http.HttpContext?.User;
            var idStr = user?.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? user?.FindFirst("sub")?.Value;
            return Guid.TryParse(idStr, out var id) ? id : Guid.Empty;
        }
    }

    public string? Name =>
        _http.HttpContext?.User?.Identity?.Name
        ?? _http.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);
}