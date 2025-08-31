using AutoMapper;
using AutoMapper.QueryableExtensions;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.DTOs.Sections;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class SectionService : ISectionService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public SectionService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<SectionDto> GetByIdAsync(int id)
        {
            var section = await _context.Sections.FindAsync(id);
            return _mapper.Map<SectionDto>(section);
        }

        public async Task<List<SectionDto>> GetSectionsByPeriodAndSubjectAsync(int academicPeriodId, int subjectId)
        {
            // TODO: El "staffId" debo obtenerlo del usuarios cuando esté listo la autenticación
            int staffId = 53;

            if (academicPeriodId <= 0 || subjectId <= 0)
            {
                throw new ArgumentException("Los IDs deben ser valores positivos");
            }

            var sections = await _context.SectionAssignments
                .Where(sa => sa.StaffId == staffId
                  && sa.AcademicPeriodId == academicPeriodId
                  && sa.SubjectId == subjectId)
                .Join(_context.Sections,
                sa => sa.SectionId,
                sec => sec.Id,
                (sa, sec) => sec)
                .Distinct()
                .ProjectTo<SectionDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return sections;
        }

        public async Task<List<SectionOptionDto>> GetOptionsAsync(int? year = null, int? enrollmentId = null, bool? isActive = null, int? gradeId = null, CancellationToken ct = default)
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
