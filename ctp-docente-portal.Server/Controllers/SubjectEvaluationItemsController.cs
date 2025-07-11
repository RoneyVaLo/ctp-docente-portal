using ctp_docente_portal.Server.DTOs.SubjectEvaluationItems;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectEvaluationItemsController : ControllerBase
    {
        private readonly ISubjectEvaluationService _service;

        public SubjectEvaluationItemsController(ISubjectEvaluationService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SubjectEvaluationItemCreateDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SubjectEvaluationItemUpdateDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpGet("section/{sectionAssignmentId}")]
        public async Task<IActionResult> GetBySectionAssignment(int sectionAssignmentId)
        {
            var result = await _service.GetBySectionAssignmentAsync(sectionAssignmentId);
            return Ok(result);
        }

        [HttpPost("draft")]
        public async Task<IActionResult> CreateDraftEvaluationItem([FromBody] EvaluationItemDraftCreateDto dto)
        {
            var draftId = await _service.CreateDraftEvaluationItemAsync(dto);
            return Ok(new { EvaluationItemId = draftId });
        }
    }
}
