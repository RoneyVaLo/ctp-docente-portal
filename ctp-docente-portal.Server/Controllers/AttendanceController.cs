using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using ctp_docente_portal.Server.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _svc;
        private readonly AppDbContext _context;

        public AttendanceController(IAttendanceService svc, AppDbContext context)
        {
            _svc = svc;
            _context = context;
        }

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

        // 5) NUEVO: Lista de estudiantes por sección (para no agregarlos 1x1)
        [HttpGet("students")]
        public async Task<ActionResult<List<StudentOptionDto>>> GetStudents(
            [FromQuery] int sectionId,
            [FromQuery] int? subjectId, // por ahora opcional; reservado para futuro
            CancellationToken ct = default)
        {
            if (sectionId <= 0) return Ok(new List<StudentOptionDto>());

            var list = await (from ss in _context.SectionStudents.AsNoTracking()
                              join s in _context.Students.AsNoTracking() on ss.StudentId equals s.Id
                              where ss.SectionId == sectionId && ss.isActive && s.isActive
                              select new StudentOptionDto
                              {
                                  Id = s.Id,
                                  Name = ((s.Name ?? "") + " " + (s.MiddleName ?? "") + " " + (s.LastName ?? "") + " " + (s.ndLastName ?? "")).Trim()
                              })
                             .OrderBy(x => x.Name)
                             .ToListAsync(ct);

            return Ok(list);
        }
    }
}
