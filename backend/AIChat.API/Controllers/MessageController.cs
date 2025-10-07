using AIChat.API.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIChat.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class MessageController: ControllerBase
{
    private readonly IMessageService _messageService;
    public MessageController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] PostMessage message)
    {
        try
        {
            var dto = await _messageService.SendAsync(message.Text);
            return Ok(dto);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetMessages(DateTimeOffset? since, int? take)
    {
        try
        {
            var list = await _messageService.GetRecentAsync(since, take ?? 50);
            return Ok(list);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}