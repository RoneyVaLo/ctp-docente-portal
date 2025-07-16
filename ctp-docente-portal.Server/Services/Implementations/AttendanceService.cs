using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.Helpers;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace ctp_docente_portal.Server.Services.Implementations
{
    public class AttendanceService : IAttendanceService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;

        public AttendanceService(AppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task CreateGroupAttendanceAsync(CreateGroupAttendanceDto dto)
        {
            var attendances = dto.Students.Select(student => new Attendance
            {
                StudentId = student.StudentId,
                SectionId = dto.SectionId,
                Date = dto.Date,
                StatusTypeId = student.StatusTypeId,
                Observations = student.Observations,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1 // luego sustituir por el ID del usuario autenticado
            }).ToList();

            _context.Attendances.AddRange(attendances);
            await _context.SaveChangesAsync();

            foreach (var a in attendances.Where(a => a.StatusTypeId == 2))
            {
                await _notificationService.QueueAbsenceMessageAsync(a);
            }
        }

        public async Task UpdateAsync(UpdateAttendanceDto dto)
        {
            var attendance = await _context.Attendances.FindAsync(dto.Id);
            if (attendance == null)
                throw new Exception("Asistencia no encontrada.");

            if (!DateHelper.IsValidEditDate(attendance.Date))
                throw new Exception("Solo se pueden editar asistencias de los últimos 7 días.");

            if (!DateHelper.IsWeekday(attendance.Date))
                throw new Exception("No se puede modificar una asistencia de fin de semana.");

            attendance.StatusTypeId = dto.StatusTypeId;
            attendance.Observations = dto.Observations;
            attendance.UpdatedAt = DateTime.UtcNow;
            attendance.UpdatedBy = 1;

            await _context.SaveChangesAsync();
        }

        public async Task<List<Attendance>> GetAsync(AttendanceQueryDto filter)
        {
            var query = _context.Attendances.AsQueryable();

            if (filter.StudentId.HasValue)
                query = query.Where(a => a.StudentId == filter.StudentId);
            if (filter.SectionId.HasValue)
                query = query.Where(a => a.SectionId == filter.SectionId);
            if (filter.StatusTypeId.HasValue)
                query = query.Where(a => a.StatusTypeId == filter.StatusTypeId);
            if (filter.FromDate.HasValue)
                query = query.Where(a => a.Date >= filter.FromDate.Value);
            if (filter.ToDate.HasValue)
                query = query.Where(a => a.Date <= filter.ToDate.Value);

            return await query.OrderByDescending(a => a.Date).ToListAsync();
        }

        public async Task<List<AttendanceSummaryDto>> GetSummaryByGroupAsync(int sectionId)
        {
            var data = await _context.Attendances
                .Where(a => a.SectionId == sectionId)
                .GroupBy(a => a.StudentId)
                .Select(g => new AttendanceSummaryDto
                {
                    StudentId = g.Key,
                    TotalPresent = g.Count(a => a.StatusTypeId == 1),
                    TotalAbsent = g.Count(a => a.StatusTypeId == 2),
                    TotalJustified = g.Count(a => a.StatusTypeId == 3),
                    TotalLate = g.Count(a => a.StatusTypeId == 4),
                })
                .ToListAsync();

            return data;
        }

        public async Task CreateAsync(CreateAttendanceDto dto)
        {
            var attendance = new Attendance
            {
                StudentId = dto.StudentId,
                SectionId = dto.SectionId,
                Date = dto.Date,
                StatusTypeId = dto.StatusTypeId,
                Observations = dto.Observations,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1 // Reemplazar luego por usuario autenticado
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();
        }
    }
}
