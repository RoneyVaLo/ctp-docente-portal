using ctp_docente_portal.Server.DTOs.Sections;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
    }
}
