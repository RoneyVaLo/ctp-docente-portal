using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.DTOs.Students;
using ctp_docente_portal.Server.Services.Implementations;
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
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentsController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        // /api/students/section/{sectionId}
        [HttpGet("section/{sectionId}")]
        public async Task<ActionResult<List<StudentDto>>> GetSectionStudents(int sectionId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var students = await _studentService.GetStudentsBySectionAsync(sectionId, userId);
            return Ok(students);
        }

        [HttpPost]
        public async Task<IActionResult> GetReporteEstudiantes([FromBody] ReportFilterDto filter)
        {
            var reporte = await _studentService.GetStudentReportsAsync(filter);
            return Ok(reporte);
        }

        [HttpPost("student/{id}")]
        public async Task<IActionResult> GetStudentDetail(int id, [FromBody] ReportFilterDto filter)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var student = await _studentService.GetStudentDetailAsync(userId, id, filter);
            if (student == null)
                return NotFound();

            return Ok(student);
        }
    }
}
