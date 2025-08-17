using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Attendance;

namespace ctp_docente_portal.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly AppDbContext _context;
    public AttendanceController(AppDbContext context) => _context = context;

    // --------------------------------------------------------------------
    // 1) Secciones activas para el selector (id + nombre)
    // GET: /api/attendance/sections
    // --------------------------------------------------------------------
    [HttpGet("sections")]
    public async Task<ActionResult<List<SectionOptionDto>>> GetSections(CancellationToken ct = default)
    {
        var list = await _context.Sections
            .AsNoTracking()
            .Where(s => s.IsActive)                     // <-- en tu modelo es isActive (minúscula)
            .OrderBy(s => s.Name)
            .Select(s => new SectionOptionDto
            {
                Id = s.Id,
                Name = s.Name
            })
            .ToListAsync(ct);

        return Ok(list);
    }

    // --------------------------------------------------------------------
    // 2) Roster de estudiantes por sección (id + nombre completo)
    // GET: /api/attendance/students?sectionId=1
    // --------------------------------------------------------------------
    [HttpGet("students")]
    public async Task<ActionResult<List<StudentOptionDto>>> GetStudents(
        [FromQuery] int sectionId, CancellationToken ct = default)
    {
        if (sectionId <= 0) return Ok(new List<StudentOptionDto>());

        var list = await (
            from ss in _context.SectionStudents.AsNoTracking()
            join st in _context.Students.AsNoTracking() on ss.StudentId equals st.Id
            where ss.SectionId == sectionId && ss.IsActive && st.IsActive
            orderby st.Name, st.LastName, st.NdLastName
            select new StudentOptionDto
            {
                Id = st.Id,
                Name =
                    $"{(st.Name ?? "").Trim()} {(st.MiddleName ?? "").Trim()} {(st.LastName ?? "").Trim()} {(st.NdLastName ?? "").Trim()}".Trim()
            }
        ).ToListAsync(ct);

        return Ok(list);
    }

    // --- (deja aquí cualquier otro endpoint de asistencia que ya tengas) ---
}
