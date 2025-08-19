using ctp_docente_portal.Server.DTOs.EvaluationItems;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvaluationItemsController : ControllerBase
    {
        private readonly IEvaluationItemService _service;

        public EvaluationItemsController(IEvaluationItemService service)
        {
            _service = service;
        }

        // 📌 POST /api/evaluationitems/
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EvaluationItemCreateDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        // 📌 POST /api/evaluationitems/draft
        [HttpPost("draft")]
        public async Task<IActionResult> CreateDraftEvaluationItem([FromBody] EvaluationItemDraftCreateDto dto)
        {
            var draftId = await _service.CreateDraftEvaluationItemAsync(dto);
            return Ok(new { EvaluationItemId = draftId });
        }

        // 📌 PUT /api/evaluationitems/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EvaluationItemUpdateDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return Ok(result);
        }

        // 📌 DELETE /api/evaluationitems/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        // 📌 GET /api/evaluationitems/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            return Ok(result);
        }

        // 📌 GET /api/evaluationitems/subject/{subjectId}/section/{sectionId}
        [HttpGet("subject/{subjectId}/section/{sectionId}")]
        public async Task<IActionResult> GetBySectionAssignment(int subjectId, int sectionId)
        {
            var result = await _service.GetItemsBySubjectAndSectionAsync(subjectId, sectionId);
            return Ok(result);
        }

        // 📌 GET /api/evaluationitems/item/{itemId}
        [HttpGet("item/{itemId}")]
        public async Task<IActionResult> GetItemDetails(int itemId)
        {
            var result = await _service.GetDetailsByIdAsync(itemId);
            return Ok(result);
        }

        // 📌 GET /api/evaluationitems/item/{itemId}/students/{studentId}
        [HttpGet("item/{itemId}/students/{studentId}")]
        public async Task<IActionResult> GetItemDetailsForStudent(int itemId, int studentId)
        {
            var result = await _service.GetDetailsByIdAsync(itemId, studentId);
            return Ok(result);
        }
    }
}
