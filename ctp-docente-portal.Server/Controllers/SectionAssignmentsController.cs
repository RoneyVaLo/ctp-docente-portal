using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.SectionAssignments;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SectionAssignmentsController : ControllerBase
    {
        private readonly ISectionAssignmentsService _sectionAssignmentsService;

        public SectionAssignmentsController(ISectionAssignmentsService sectionAssignmentsService)
        {
            _sectionAssignmentsService = sectionAssignmentsService;
        }

        [HttpGet]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<ActionResult<PagedResult<SectionAssignmentDto>>> GetAllAsync([FromQuery] PaginationParams paginationParams)
        {
            var sectionAssignments = await _sectionAssignmentsService.GetAllAsync(paginationParams);
            return Ok(sectionAssignments);
        }

        [HttpPost]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> Create([FromBody] SectionAssignmentCreateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _sectionAssignmentsService.CreateAsync(dto, userId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] SectionAssignmentUpdateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var result = await _sectionAssignmentsService.UpdateAsync(dto, userId);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            await _sectionAssignmentsService.DeleteAsync(id);
            return NoContent();
        }
    }
}
