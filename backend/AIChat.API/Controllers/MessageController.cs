using AIChat.API.Dtos;
using AIChat.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIChat.API.Controllers;

[ApiController]
[Route("api/messages")]               // <-- ROTAYI SABİTLEDİK (çoğul)
[Authorize]                           // JWT ile korumaya devam
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessagesController(IMessageService messageService)
        => _messageService = messageService;

    // GET /api/messages?since=...&take=...
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages(
        [FromQuery] DateTimeOffset? since, 
        [FromQuery] int? take)
    {
        var list = await _messageService.GetRecentAsync(since, take ?? 50);
        return Ok(list);
    }

    // POST /api/messages
    [HttpPost]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] PostMessage message)
    {
        if (message is null || string.IsNullOrWhiteSpace(message.Text))
            return BadRequest("text is required");

        var dto = await _messageService.SendAsync(message.Text);
        return Ok(dto);
    }
}
