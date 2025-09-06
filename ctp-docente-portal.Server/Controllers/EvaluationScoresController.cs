using ctp_docente_portal.Server.DTOs.EvaluationItems;
using ctp_docente_portal.Server.DTOs.StudentEvaluationScores;
using ctp_docente_portal.Server.DTOs.Students;
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
    public class EvaluationScoresController : ControllerBase
    {
        private readonly IEvaluationScoreService _evaluationScoreService;
        private readonly IEvaluationItemService _evaluationItemService;

        public EvaluationScoresController(IEvaluationScoreService evaluationScoreService, IEvaluationItemService evaluationItemService)
        {
            _evaluationScoreService = evaluationScoreService;
            _evaluationItemService = evaluationItemService;
        }

        [HttpGet("subject/{subjectId}/section/{sectionId}")]
        public async Task<IActionResult> GetEvaluationMatrixBySection(int subjectId, int sectionId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var matrix = await _evaluationScoreService.GetStudentScoresMatrixAsync(subjectId, sectionId, userId);
            var items = await _evaluationItemService.GetItemsBySubjectAndSectionAsync(subjectId, sectionId, userId);

            var response = new EvaluationMatrixResponseDto
            {
                Students = matrix,
                Items = items,
            };

            return Ok(response);
        }

        // POST /api/evaluationscores/section/{sectionId}/
        [HttpPost("section/{sectionId}")]
        public async Task<IActionResult> UpsertScores(int sectionId,[FromBody] List<StudentEvaluationScoreDto> scores)
        {
            await _evaluationScoreService.UpsertStudentScoresAsync(sectionId, scores);
            return Ok(new { message = "Calificaciones guardadas correctamente." });
        }
    }
}
