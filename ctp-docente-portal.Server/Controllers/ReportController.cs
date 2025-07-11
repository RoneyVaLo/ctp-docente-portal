using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using ctp_docente_portal.Server.Helpers;
using System.Text;


namespace ctp_docente_portal.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("attendance-stats")]
        public async Task<IActionResult> GetAttendanceStats()
        {
            var result = await _reportService.GetAttendanceStatsBySectionAsync();
            return Ok(result);

        }
        [HttpGet("grades")]
        public async Task<IActionResult> GetGrades([FromQuery] int? groupId, [FromQuery] string? subject)
        {
            var result = await _reportService.GetGradesByGroupOrSubjectAsync(groupId, subject);
            return Ok(result);
        }

        [HttpGet("student-consolidated")]
        public async Task<IActionResult> GetStudentConsolidated([FromQuery] int studentId)
        {
            var result = await _reportService.GetStudentConsolidatedReportAsync(studentId);
            return Ok(result);
        }

         

        [HttpGet("attendance-stats/csv")]
        public async Task<IActionResult> ExportAttendanceStatsCsv()
        {
            var stats = await _reportService.GetAttendanceStatsBySectionAsync();
            var csv = CsvExportHelper.ExportAttendanceStats(stats);
            var bytes = Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv", "asistencia_por_seccion.csv");
        }

        [HttpGet("grades/csv")]
        public async Task<IActionResult> ExportGradesCsv([FromQuery] int? groupId, [FromQuery] string? subject)
        {
            var grades = await _reportService.GetGradesByGroupOrSubjectAsync(groupId, subject);
            var csv = CsvExportHelper.ExportGrades(grades);
            var bytes = Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv", "calificaciones.csv");
        }

        [HttpGet("grades/pdf")]
        public async Task<IActionResult> ExportGradesPdf([FromQuery] int? groupId, [FromQuery] string? subject)
        {
            var grades = await _reportService.GetGradesByGroupOrSubjectAsync(groupId, subject);
            var pdfBytes = PdfExportHelper.ExportGradesPdf(grades);
            return File(pdfBytes, "application/pdf", "reporte_calificaciones.pdf");
        }

        [HttpGet("attendance-stats/pdf")]
        public async Task<IActionResult> ExportAttendanceStatsPdf()
        {
            var stats = await _reportService.GetAttendanceStatsBySectionAsync();
            var pdfBytes = PdfExportHelper.ExportAttendanceStatsPdf(stats);
            return File(pdfBytes, "application/pdf", "reporte_asistencia.pdf");
        }




    }
}
