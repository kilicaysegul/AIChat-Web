using Microsoft.AspNetCore.Mvc;

namespace AIChat.API.Controllers
{
    [ApiController]
    [Route("healthz")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { status = "Healthy", message = "API is running!" });
        }
    }
}
