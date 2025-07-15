using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWhatsAppApiService _api;

        public NotificationController(AppDbContext context, IWhatsAppApiService api)
        {
            _context = context;
            _api = api;
        }

        [HttpPost("send-pending")]
        public async Task<IActionResult> SendPendingMessages()
        {
            var pending = await _context.WhatsAppMessages
                .Where(m => !m.Sent)
                .ToListAsync();

            int sentCount = 0;

            foreach (var msg in pending)
            {
                var success = await _api.SendMessageAsync(msg);
                if (success)
                {
                    msg.Sent = true;
                    sentCount++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { sent = sentCount });
        }
    }
}
