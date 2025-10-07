using ctp_docente_portal.Server.DTOs.EvaluationItems;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "DocenteOnly")]
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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _service.CreateAsync(userId, dto);
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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _service.UpdateAsync(userId, id, dto);
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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _service.GetItemsBySubjectAndSectionAsync(subjectId, sectionId, userId);
            return Ok(result);
        }

        // 📌 GET /api/evaluationitems/item/{itemId}
        [HttpGet("item/{itemId}")]
        public async Task<IActionResult> GetItemDetails(int itemId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _service.GetDetailsByIdAsync(itemId, userId);
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
