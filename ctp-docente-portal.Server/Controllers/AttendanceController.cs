using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _svc;
        public AttendanceController(IAttendanceService svc) => _svc = svc;

        // 1) Registrar asistencia de un grupo (fecha/ sección / lista de estudiantes)
        [HttpPost("group")]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupAttendanceDto dto)
        {
            await _svc.CreateGroupAttendanceAsync(dto);
            return Ok();
        }

        // 2) Editar un registro existente
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateAttendanceDto dto)
        {
            await _svc.UpdateAsync(dto);
            return Ok();
        }

        // 3) Consultar con filtros (fecha, sección, estado)
        [HttpGet]
        public async Task<ActionResult<List<Attendance>>> Get([FromQuery] AttendanceQueryDto filter)
        {
            var data = await _svc.GetAsync(filter);
            return Ok(data);
        }

        // 4) Vista consolidada / resumen por grupo
        [HttpGet("summary")]
        public async Task<ActionResult<List<AttendanceSummaryDto>>> GetSummary([FromQuery] int sectionId)
        {
            var data = await _svc.GetSummaryByGroupAsync(sectionId);
            return Ok(data);
        }
    }
}
