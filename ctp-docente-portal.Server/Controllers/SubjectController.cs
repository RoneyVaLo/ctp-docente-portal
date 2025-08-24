using ctp_docente_portal.Server.DTOs.Subjects;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectService _subjectService;

        public SubjectController(ISubjectService subjectService)
        {
            _subjectService = subjectService;
        }

        // GET: api/subject/period/{academicPeriodId}/subjects
        [HttpGet("period/{academicPeriodId}/subjects")]
        public async Task<ActionResult<List<SubjectDto>>> GetSubjects(int academicPeriodId)
        {
            var subjects = await _subjectService.GetSubjectsByPeriodAsync(academicPeriodId);
            return Ok(subjects);
        }
    }
}
