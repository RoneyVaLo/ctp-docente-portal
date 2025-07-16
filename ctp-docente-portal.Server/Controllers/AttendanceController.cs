using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using ctp_docente_portal.Server.DTOs.Attendance;


namespace ctp_docente_portal.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        // NUEVO ENDPOINT PARA ASISTENCIA GRUPAL
        [HttpPost("group")]
        public async Task<IActionResult> CreateGroupAttendance([FromBody] CreateGroupAttendanceDto dto)
        {
            await _attendanceService.CreateGroupAttendanceAsync(dto);
            return Ok(new { message = "Asistencia grupal registrada correctamente." });
        }
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateAttendanceDto dto)
        {
            await _attendanceService.UpdateAsync(dto);
            return Ok(new { message = "Asistencia actualizada correctamente." });
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] AttendanceQueryDto filter)
        {
            var result = await _attendanceService.GetAsync(filter);
            return Ok(result);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] int sectionId)
        {
            var result = await _attendanceService.GetSummaryByGroupAsync(sectionId);
            return Ok(result);
        }
        



    }
}
