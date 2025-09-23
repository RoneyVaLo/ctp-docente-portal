using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CsvReportController : ControllerBase
    {
        private readonly ICsvReportService _service;

        public CsvReportController(ICsvReportService service)
        {
            _service = service;
        }

        [HttpPost("students")]
        public IActionResult ExportStudentsCsv([FromBody] ReportFilterDto filter)
        {
            var csvBytes = _service.GenerateStudentCsv(filter);

            return File(csvBytes, "text/csv", "students.csv");
        }
    }
}
