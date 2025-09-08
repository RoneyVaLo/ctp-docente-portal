using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.Subjects;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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


        [HttpPost]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> Create([FromBody] CreateSubjectDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _subjectService.CreateSubjectAsync(dto, userId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSubjectDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _subjectService.UpdateSubjectAsync(id, dto, userId);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<ActionResult<List<SubjectDto>>> GetAllSubjectsAsync()
        {
            var subjects = await _subjectService.GetAllSubjectsAsync();
            return Ok(subjects);
        }

        [HttpGet("pagination")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<ActionResult<PagedResult<SubjectDto>>> GetAllSubjectsPaginated([FromQuery] PaginationParams paginationParams)
         {
            var result = await _subjectService.GetAllSubjectsWithPaginationAsync(paginationParams);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _subjectService.DeleteSubjectAsync(id);
            return success ? NoContent() : NotFound();
        }

        // GET: api/subject/period/{academicPeriodId}/subjects
        [HttpGet("period/{academicPeriodId}/subjects")]
        [Authorize(Policy = "DocenteOnly")]
        public async Task<ActionResult<List<SubjectDto>>> GetSubjects(int academicPeriodId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var subjects = await _subjectService.GetSubjectsByPeriodAsync(academicPeriodId, userId);
            return Ok(subjects);
        }
        [HttpGet("all")]
        public async Task<ActionResult<List<SubjectDto>>> GetSubjects()
        {
            var subjects = await _subjectService.GetAllSubjectsAsync();
            return Ok(subjects);
        }

    }
}
