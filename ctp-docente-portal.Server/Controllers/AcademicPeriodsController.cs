using ctp_docente_portal.Server.DTOs.AcademicPeriod;
using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.Subjects;
using ctp_docente_portal.Server.Services.Implementations;
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
    public class AcademicPeriodsController : ControllerBase
    {
        private readonly IAcademicPeriodService _service;

        public AcademicPeriodsController(IAcademicPeriodService service)
        {
            _service = service;
        }
                
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("pagination")]
        //[Authorize(Policy = "AdministrativoOnly")]
        public async Task<ActionResult<PagedResult<SubjectDto>>> GetAllSubjectsPaginated([FromQuery] PaginationParams paginationParams)
        {
            var result = await _service.GetAllWithPaginationAsync(paginationParams);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> Create([FromBody] CreateAcademicPeriodDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var created = await _service.CreateAsync(dto, userId);
            return Ok(created);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAcademicPeriodDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var updated = await _service.UpdateAsync(id, dto, userId);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
