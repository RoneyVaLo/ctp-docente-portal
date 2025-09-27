using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Attendance;
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
            var utcNow = DateTime.UtcNow;
            var userId = 1;

            DateTime takenAtUtc = dto.TakenAt.Kind switch
            {
                DateTimeKind.Utc => dto.TakenAt,
                DateTimeKind.Local => dto.TakenAt.ToUniversalTime(),
                DateTimeKind.Unspecified => DateTime.SpecifyKind(dto.TakenAt, DateTimeKind.Local).ToUniversalTime()
            };

            await using var tx = await _context.Database.BeginTransactionAsync();

            // Estados previos (para notificar solo si cambian a ausente)
            var prev = await _context.Attendances
                .Where(a => a.SectionId == dto.SectionId
                         && a.SubjectId == dto.SubjectId
                         && a.Date == dto.Date)
                .ToDictionaryAsync(a => a.StudentId, a => a.StatusTypeId);

            foreach (var st in dto.Students)
            {
                var status = st.StatusTypeId;
                var minutes = st.MinutesLate ?? 0;
                var obs = st.Observations ?? string.Empty;

                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO ""Attendances""
                        (""StudentId"", ""SectionId"", ""SubjectId"", ""Date"", ""TakenAt"",
                         ""StatusTypeId"", ""MinutesLate"", ""Observations"", ""CreatedAt"", ""CreatedBy"")
                    VALUES
                        ({st.StudentId}, {dto.SectionId}, {dto.SubjectId}, {dto.Date}, {takenAtUtc},
                         {status}, {minutes}, {obs}, {utcNow}, {userId})
                    ON CONFLICT (""StudentId"", ""SectionId"", ""SubjectId"", ""Date"")
                    DO UPDATE SET
                        ""StatusTypeId"" = EXCLUDED.""StatusTypeId"",
                        ""MinutesLate""  = EXCLUDED.""MinutesLate"",
                        ""Observations"" = EXCLUDED.""Observations"",
                        ""TakenAt""      = EXCLUDED.""TakenAt"",
                        ""UpdatedAt""    = {utcNow},
                        ""UpdatedBy""    = {userId};");

                var hadPrev = prev.TryGetValue(st.StudentId, out var beforeStatus);
                var becameAbsent = (status == 2) && (!hadPrev || beforeStatus != 2);
                if (becameAbsent)
                {
                    await _notificationService.QueueAbsenceMessageAsync(
                        studentId: st.StudentId,
                        studentName: string.IsNullOrWhiteSpace(st.StudentName) ? $"Estudiante {st.StudentId}" : st.StudentName,
                        phone: st.Phone ?? "",
                        date: dto.Date,
                        sectionId: dto.SectionId,
                        subjectId: dto.SubjectId
                    );
                }
            }

            await tx.CommitAsync();
        }

        public async Task UpdateAsync(UpdateAttendanceDto dto)
        {
            var attendance = await _context.Attendances.FindAsync(dto.Id);
            if (attendance == null)
                throw new Exception("Asistencia no encontrada.");

            attendance.StatusTypeId = dto.StatusTypeId;
            attendance.Observations = dto.Observations;
            //attendance.MinutesLate = dto.MinutesLate; 
            //attendance.TakenAt = dto.TakenAt ?? attendance.TakenAt;

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

            if (filter.SubjectId.HasValue)
                query = query.Where(a => a.SubjectId == filter.SubjectId);

            if (filter.StatusTypeId.HasValue)
                query = query.Where(a => a.StatusTypeId == filter.StatusTypeId);

            if (filter.FromDate.HasValue)
                query = query.Where(a => a.Date >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                query = query.Where(a => a.Date <= filter.ToDate.Value);

            return await query
                .OrderByDescending(a => a.Date)
                .ThenByDescending(a => a.TakenAt)
                .ToListAsync();
        }

        public async Task<List<AttendanceSummaryDto>> GetSummaryByGroupAsync(int sectionId)
        {
            return await _context.Attendances
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
        }
    }
}
