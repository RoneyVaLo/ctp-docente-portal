using ctp_docente_portal.Server.DTOs.StudentCriteriaScores;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "DocenteOnly")]
    public class StudentCriteriaScoresController : ControllerBase
    {
        private readonly IStudentCriteriaScoreService _criteriaScoreService;

        public StudentCriteriaScoresController(IStudentCriteriaScoreService criteriaScoreService)
        {
            _criteriaScoreService = criteriaScoreService;
        }

        // POST /api/studentcriteriascores/section/{sectionId}
        [HttpPost("section/{sectionId}")]
        public async Task<IActionResult> UpsertCriteriaScores(
        int sectionId,
        [FromBody] List<StudentCriteriaScoresDto> scores)
        {
            await _criteriaScoreService.UpsertStudentCriteriaScoresAsync(sectionId, scores);
            return Ok(new { message = "Calificaciones de criterios guardadas correctamente." });
        }
    }
}
