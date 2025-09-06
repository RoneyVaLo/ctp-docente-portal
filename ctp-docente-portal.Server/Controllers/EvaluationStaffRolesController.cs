using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.EvaluationStaffRole;
using ctp_docente_portal.Server.DTOs.Subjects;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EvaluationStaffRolesController : ControllerBase
    {
        private readonly IEvaluationStaffRoleService _service;

        public EvaluationStaffRolesController(IEvaluationStaffRoleService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EvaluationStaffRoleDto>> GetById(int id)
        {
            return Ok(await _service.GetByIdAsync(id));
        }

        [HttpGet]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<ActionResult<IEnumerable<EvaluationStaffRoleDto>>> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("pagination")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<ActionResult<PagedResult<SubjectDto>>> GetAllSubjectsPaginated([FromQuery] PaginationParams paginationParams)
        {
            var result = await _service.GetAllWithPaginationAsync(paginationParams);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<ActionResult<EvaluationStaffRoleDto>> Create(EvaluationStaffRoleCreateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _service.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<ActionResult<EvaluationStaffRoleDto>> Update(int id, EvaluationStaffRoleUpdateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return Ok(await _service.UpdateAsync(id, dto, userId));
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
