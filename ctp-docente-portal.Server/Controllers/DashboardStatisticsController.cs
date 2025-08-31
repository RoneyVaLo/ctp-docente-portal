using ctp_docente_portal.Server.DTOs.DashboardStatistics;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    /// <summary>
    /// API Controller that exposes endpoints for dashboard statistics.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardStatisticsController : ControllerBase
    {
        private readonly IDashboardStatisticsService _dashboardStatisticsService;

        /// <summary>
        /// Initializes a new instance of the <see cref="DashboardStatisticsController"/> class.
        /// </summary>
        /// <param name="dashboardStatisticsService">Service that provides dashboard statistics.</param>
        public DashboardStatisticsController(IDashboardStatisticsService dashboardStatisticsService)
        {
            _dashboardStatisticsService = dashboardStatisticsService;
        }

        /// <summary>
        /// Gets a teacher summary for a given staff member and academic period.
        /// </summary>
        /// <param name="staffId">Unique identifier of the teacher.</param>
        /// <param name="periodoId">Identifier of the academic period.</param>
        /// <returns>
        /// An <see cref="ActionResult{TeacherSummaryDto}"/> containing sections, attendance and pending evaluations information.
        /// </returns>
        [HttpGet("teacher")]
        [Authorize(Policy = "DocenteOnly")]
        public async Task<ActionResult<TeacherSummaryDto>> GetResumen([FromQuery] int staffId, [FromQuery] int periodoId)
        {
            // TODO: Asignar las autorizaciones
            var resumen = await _dashboardStatisticsService.GetTeacherSummaryAsync(staffId, periodoId);
            return Ok(resumen);
        }

        /// <summary>
        /// Gets an administrative summary with global institution metrics.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing student, attendance and teacher data.
        /// </returns>
        [HttpGet("administrative")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> GetSummary()
        {
            var result = await _dashboardStatisticsService.GetAdministrativeSummaryAsync();
            return Ok(result);
        }

        /// <summary>
        /// Gets the top sections with the highest absenteeism rates for the current date.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing a list of <see cref="TopSectionAbsencesDto"/>.
        /// </returns>
        [HttpGet("top-sections-absences")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> GetTopSeccionesAusentismo()
        {
            var result = await _dashboardStatisticsService.GetTopAbsenteeismSectionsAsync();
            return Ok(result);
        }

        /// <summary>
        /// Gets the grade distribution of students grouped by performance ranges.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing a list of <see cref="GradeDistributionDto"/>.
        /// </returns>
        [HttpGet("grades-distribution")]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> GetDistribucionNotas()
        {
            var result = await _dashboardStatisticsService.GetGradeDistributionAsync();
            return Ok(result);
        }
    }
}
