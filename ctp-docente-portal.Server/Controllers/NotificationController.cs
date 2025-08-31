using Microsoft.AspNetCore.Mvc;
using ctp_docente_portal.Server.DTOs.Notifications;
using ctp_docente_portal.Server.Services.Interfaces;

namespace ctp_docente_portal.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notifications;
        private readonly IWhatsAppApiService _wa;

        public NotificationsController(INotificationService notifications, IWhatsAppApiService wa)
        {
            _notifications = notifications;
            _wa = wa;
        }

        [HttpPost("absences")]
        public async Task<ActionResult<SendAbsencesResponse>> SendAbsences([FromBody] SendAbsencesRequest request, CancellationToken ct)
            => Ok(await _notifications.SendAbsencesAsync(request, ct));

        [HttpGet]
        public async Task<ActionResult> List([FromQuery] DateOnly? date, [FromQuery] int? sectionId, [FromQuery] string? status, CancellationToken ct)
            => Ok(await _notifications.ListAsync(date, sectionId, status, ct));

        [HttpPost("{id:int}/resend")]
        public async Task<IActionResult> Resend([FromRoute] int id, CancellationToken ct)
            => (await _notifications.ResendMessageAsync(id, ct)) ? NoContent() : NotFound();

        // Test real a WhatsApp Cloud API
        [HttpPost("test")]
        public async Task<IActionResult> Test([FromBody] TestSendRequest req, CancellationToken ct)
        {
            var result = await _wa.SendTextAsync(req.To, req.Message, ct);
            return result.Success
                ? Ok(new { ok = true, result.ProviderMessageId })
                : StatusCode(502, new { ok = false, error = result.Error });
        }
    }}