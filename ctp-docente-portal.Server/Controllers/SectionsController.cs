using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SectionsController : ControllerBase
    {
        private readonly ISectionsService _svc;
        public SectionsController(ISectionsService svc) => _svc = svc;

        // GET /api/sections/active
        [HttpGet("active")]
        public async Task<ActionResult<List<SectionOptionDto>>> GetActive(CancellationToken ct)
        {
            var data = await _svc.GetOptionsAsync(isActive: true, ct: ct);
            return Ok(data);
        }

        // (opcional) genérico con filtros
        [HttpGet]
        public async Task<ActionResult<List<SectionOptionDto>>> Get(
            [FromQuery] int? year,
            [FromQuery] int? enrollmentId,
            [FromQuery] bool? isActive,
            [FromQuery] int? gradeId,
            CancellationToken ct)
        {
            var data = await _svc.GetOptionsAsync(year, enrollmentId, isActive, gradeId, ct);
            return Ok(data);
        }
    }
}
