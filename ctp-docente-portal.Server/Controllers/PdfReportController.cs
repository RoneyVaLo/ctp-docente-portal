using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.DTOs.Reports.PDF;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.ConstrainedExecution;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PdfReportController : ControllerBase
    {
        private readonly IPdfReportService _service;

        public PdfReportController(IPdfReportService service)
        {
            _service = service;
        }

        [HttpPost("rendimiento-general")]
        public async Task<IActionResult> GeneralPerformance([FromBody] ReportFilterDto filter)
        {
            var pdfBytes = await _service.GenerateGeneralPerformanceAsync(filter);

            var fileName = $"RendimientoGeneral_Seccion{filter.SectionId}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }

        [HttpPost("asistencia-por-mes")]
        public async Task<IActionResult> AttendancePerMonth([FromBody] ReportFilterDto filter)
        {
            var pdfBytes = await _service.GetAttendancePerMonthAsync(filter);

            var fileName = $"AsistenciaPorMes_{filter.SectionId}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }

        [HttpPost("estudiantes-por-materia")]
        public async Task<IActionResult> EstudiantesPorMateria([FromBody] ReportFilterDto filter)
        {
            var pdf = await _service.GetStudentsBySubjectAsync(filter);
            return File(pdf, "application/pdf", "EstudiantesPorMateria.pdf");
        }

        [HttpPost("rendimiento-estudiante/{studentId}")]
        public async Task<IActionResult> RendimientoEstudiante(int studentId, [FromBody] ReportFilterDto filter)
        {
            var pdf = await _service.GetStudentPerformanceAsync(studentId, filter);
            return File(pdf, "application/pdf", "RendimientoEstudiante.pdf");
        }
    }
}
