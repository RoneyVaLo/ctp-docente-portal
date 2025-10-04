using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _reportsService.GetGradesAsync(userId, filter);
            return Ok(result);
        }

        [HttpPost("attendance")]
        public async Task<IActionResult> GetAttendance([FromBody] ReportFilterDto filter)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _reportsService.GetAttendanceAsync(userId, filter);
            return Ok(result);
        }

        [HttpPost("group-report")]
        public async Task<IActionResult> GetGroupReport([FromBody] ReportFilterDto filter)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _reportsService.GetPerformanceDataAsync(userId, filter);
            return Ok(result);
        }

        [HttpPost("general-stats")]
        public async Task<IActionResult> GetGeneralStats([FromBody] ReportFilterDto filter)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _reportsService.GetGeneralStatsAsync(userId, filter);
            return Ok(result);
        }
    }
}