using AutoMapper;
using AutoMapper.QueryableExtensions;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.DTOs.Sections;
using ctp_docente_portal.Server.DTOs.Users;
using ctp_docente_portal.Server.Models;
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

        public async Task<List<SectionDto>> GetAllAsync(int userId, int academicPeriodId)
        {
            // Obtener StaffId asociado al usuario
            var staffId = await _context.StaffUserLinks
                .Where(x => x.UserId == userId)
                .Select(x => x.StaffId)
                .FirstOrDefaultAsync();

            if (staffId == 0)
                return new List<SectionDto>();

            // Traer nombres de roles en una sola query
            var roleNames = await (
                from sr in _context.EvaluationStaffRoles
                join r in _context.EvaluationRoles on sr.RoleId equals r.Id
                where sr.StaffId == staffId
                select r.Name
            ).ToListAsync();

            IQueryable<SectionsModel> query;

            if (roleNames.Contains("Administrativo"))
            {
                // Administrativos ven todas las secciones
                query =
                    from s in _context.Sections
                    join sa in _context.SectionAssignments on s.Id equals sa.SectionId
                    where sa.AcademicPeriodId == academicPeriodId
                    select s;
            }
            else if (roleNames.Contains("Docente"))
            {
                // Docentes ven solo secciones asignadas en el periodo
                query =
                    from s in _context.Sections
                    join sa in _context.SectionAssignments on s.Id equals sa.SectionId
                    where sa.StaffId == staffId && sa.AcademicPeriodId == academicPeriodId
                    select s;
            }
            else
            {
                return new List<SectionDto>();
            }

            var sections = await query
                .OrderBy(x => x.Id)
                .ThenBy(x => x.Name)
                .AsNoTracking()
                .Distinct()
                .ToListAsync();

            return _mapper.Map<List<SectionDto>>(sections);
        }

        public async Task<SectionDto> GetByIdAsync(int id)
        {
            var section = await _context.Sections.FindAsync(id);
            return _mapper.Map<SectionDto>(section);
        }

        public async Task<List<SectionDto>> GetSectionsByPeriodAndSubjectAsync(int academicPeriodId, int subjectId, int userId)
        {
            int staffId = await _context.StaffUserLinks
                .Where(x => x.UserId == userId)
                .Select(x => x.StaffId)
                .FirstOrDefaultAsync();
            if (staffId == 0)
            {
                throw new KeyNotFoundException($"Usuario con ID {userId} no encontrado");
            }

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
                .AsNoTracking()
                .Distinct()
                .OrderBy(s => s.Name)
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

        /// <summary>
        /// Obtiene las secciones asignadas a un usuario (opcionalmente filtradas por periodo y/o asignatura).
        /// </summary>
        public async Task<List<SectionDto>> GetSectionsByUserAsync(
            int userId,
            int? academicPeriodId = null,
            int? subjectId = null,
            CancellationToken ct = default)
        {
            int staffId = await _context.StaffUserLinks
                .Where(x => x.UserId == userId)
                .Select(x => x.StaffId)
                .FirstOrDefaultAsync(ct);

            if (staffId == 0)
                throw new KeyNotFoundException($"Usuario con ID {userId} no encontrado");

            var q = _context.SectionAssignments
                .AsNoTracking()
                .Where(sa => sa.StaffId == staffId);

            if (academicPeriodId.HasValue && academicPeriodId.Value > 0)
                q = q.Where(sa => sa.AcademicPeriodId == academicPeriodId.Value);

            if (subjectId.HasValue && subjectId.Value > 0)
                q = q.Where(sa => sa.SubjectId == subjectId.Value);

            var sections = await (from sa in q
                                  join s in _context.Sections.AsNoTracking() on sa.SectionId equals s.Id
                                  select s)
                                 .Distinct()
                                 .OrderBy(s => s.Name)
                                 .ProjectTo<SectionDto>(_mapper.ConfigurationProvider)
                                 .ToListAsync(ct);

            return sections;
        }
    }
}
