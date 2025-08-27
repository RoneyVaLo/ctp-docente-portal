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

        // 1) Registrar asistencia de un grupo
        [HttpPost("group")]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupAttendanceDto dto)
        {
            if (dto.SectionId <= 0) return BadRequest("SectionId es requerido.");
            if (dto.SubjectId <= 0) return BadRequest("SubjectId es requerido.");

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

        // 3) Consultar con filtros
        [HttpGet]
        public async Task<ActionResult<List<Attendance>>> Get([FromQuery] AttendanceQueryDto filter)
        {
            var data = await _svc.GetAsync(filter);
            return Ok(data);
        }

        // 4) Resumen por grupo (puedes añadir subjectId si lo deseas)
        [HttpGet("summary")]
        public async Task<ActionResult<List<AttendanceSummaryDto>>> GetSummary([FromQuery] int sectionId)
        {
            var data = await _svc.GetSummaryByGroupAsync(sectionId);
            return Ok(data);
        }

        // 5) Lista de estudiantes por sección
        [HttpGet("students")]
        public async Task<ActionResult<List<StudentOptionDto>>> GetStudents(
            [FromQuery] int sectionId,
            [FromQuery] int? subjectId,
            CancellationToken ct = default)
        {
            if (sectionId <= 0) return Ok(new List<StudentOptionDto>());

            var list = await (from ss in _context.SectionStudents.AsNoTracking()
                              join s in _context.Students.AsNoTracking() on ss.StudentId equals s.Id
                              where ss.isActive && s.isActive && ss.SectionId == sectionId
                              select new StudentOptionDto
                              {
                                  Id = s.Id,
                                  Name = ((s.Name ?? "") + " " + (s.MiddleName ?? "") + " " + (s.LastName ?? "") + " " + (s.ndLastName ?? "")).Trim()
                              })
                             .OrderBy(x => x.Name)
                             .ToListAsync(ct);

            return Ok(list);
        }

        [HttpGet("studentsList")]
        public async Task<ActionResult<List<StudentListItemDto>>> GetStudentsList(
            [FromQuery] int sectionId,
            [FromQuery] int? subjectId,
            CancellationToken ct = default)
        {
            if (sectionId <= 0) return Ok(new List<StudentListItemDto>());

            var list = await (from ss in _context.SectionStudent.AsNoTracking()
                              join s in _context.StudentsV2.AsNoTracking() on ss.StudentId equals s.Id
                              where ss.IsActive && s.IsActive && ss.SectionId == sectionId
                              select new StudentListItemDto
                              {
                                  Id = s.Id,
                                  FullName = ((s.Name ?? "") + " " + (s.MiddleName ?? "") + " " + (s.LastName ?? "") + " " + (s.NdLastName ?? "")).Trim(),
                                  IdentificationNumber = s.IdentificationNumber ?? "",
                                  Subsection = ss.Subsection,
                                  BirthDate = s.BirthDate,
                                  GenderId = s.GenderId
                              })
                             .OrderBy(x => x.FullName)
                             .ToListAsync(ct);

            return Ok(list);
        }
    }
}
