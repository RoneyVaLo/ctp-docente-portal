using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.DTOs.Reports.PDF;
using ctp_docente_portal.Server.Helpers;
using ctp_docente_portal.Server.Services.Implementations;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace ctp_docente_portal.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportsService;

        public ReportController(IReportService reportsService)
        {
            _reportsService = reportsService;
        }

        [HttpPost("grades")]
        public async Task<IActionResult> GetGrades([FromBody] ReportFilterDto filter)
        {
            var result = await _reportsService.GetGradesAsync(filter);
            return Ok(result);
        }

        [HttpPost("attendance")]
        public async Task<IActionResult> GetAttendance([FromBody] ReportFilterDto filter)
        {
            var result = await _reportsService.GetAttendanceAsync(filter);
            return Ok(result);
        }

        [HttpPost("group-report")]
        public async Task<IActionResult> GetGroupReport([FromBody] ReportFilterDto filter)
        {
            var result = await _reportsService.GetGroupReportAsync(filter);
            return Ok(result);
        }

        [HttpPost("general-stats")]
        public async Task<IActionResult> GetGeneralStats([FromBody] ReportFilterDto filter)
        {
            var result = await _reportsService.GetGeneralStatsAsync(filter);
            return Ok(result);
        }
    }
}