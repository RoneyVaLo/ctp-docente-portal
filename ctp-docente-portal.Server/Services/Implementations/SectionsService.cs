using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implentations
{
    public class SectionsService : ISectionsService
    {
        private readonly AppDbContext _context;
        public SectionsService(AppDbContext context) => _context = context;

        public async Task<List<SectionOptionDto>> GetOptionsAsync(
            int? year = null,
            int? enrollmentId = null,
            bool? isActive = null,
            int? gradeId = null,
            CancellationToken ct = default)
        {
            var query =
                from s in _context.Sections.AsNoTracking()
                join e in _context.Enrollments.AsNoTracking() on s.EnrollmentId equals e.Id
                where (!isActive.HasValue || s.IsActive == isActive.Value)
                   && (!enrollmentId.HasValue || s.EnrollmentId == enrollmentId.Value)
                   && (!gradeId.HasValue || s.GradeId == gradeId.Value)
                   && (!year.HasValue || e.Year == year.Value)
                orderby s.Name
                select new SectionOptionDto { Id = s.Id, Name = s.Name };

            return await query.ToListAsync(ct);
        }
    }
}