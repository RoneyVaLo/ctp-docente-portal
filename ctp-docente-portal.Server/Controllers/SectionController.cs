using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.DTOs.Sections;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SectionController : ControllerBase
    {
        private readonly ISectionService _sectionService;

        public SectionController(ISectionService sectionService)
        {
            _sectionService = sectionService;
        }

        // GET: api/section/period/{academicPeriodId}/subjects/{subjectId}/sections
        [HttpGet("period/{academicPeriodId}/subjects/{subjectId}/sections")]
        public async Task<ActionResult<List<SectionDto>>> GetSections(int academicPeriodId, int subjectId)
        {
            var sections = await _sectionService.GetSectionsByPeriodAndSubjectAsync(academicPeriodId, subjectId);
            return Ok(sections);
        }

        // GET /api/section/active
        [HttpGet("active")]
        public async Task<ActionResult<List<SectionOptionDto>>> GetActive(CancellationToken ct)
        {
            var data = await _sectionService.GetOptionsAsync(isActive: true, ct: ct);
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
            var data = await _sectionService.GetOptionsAsync(year, enrollmentId, isActive, gradeId, ct);
            return Ok(data);
        }
    }
}
