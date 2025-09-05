using AutoMapper;
using AutoMapper.QueryableExtensions;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Subjects;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class SubjectService : ISubjectService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        public SubjectService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<SubjectDto> GetByIdAsync(int id)
        {
            var subject = await _context.Subjects.FindAsync(id);
            return _mapper.Map<SubjectDto>(subject);
        }

        public async Task<List<SubjectDto>> GetSubjectsByPeriodAsync(int academicPeriodId)
        {
            // TODO: El "staffId" debo obtenerlo del usuarios cuando esté listo la autenticación
            int staffId = 53;

            if (academicPeriodId <= 0)
            {
                throw new ArgumentException("El ID del período académico debe ser positivo");
            }

            var subjects = await _context.SectionAssignments
        .Where(sa => sa.StaffId == staffId && sa.AcademicPeriodId == academicPeriodId)
        .Join(_context.Subjects,
            sa => sa.SubjectId,
            s => s.Id,
            (sa, s) => s)
        .Distinct()
        .ProjectTo<SubjectDto>(_mapper.ConfigurationProvider) // AutoMapper QueryableExtensions
        .ToListAsync();

            return subjects;
        }
        public async Task<List<SubjectDto>> GetAllSubjectsAsync()
        {
            return await _context.Subjects
                .Select(s => new SubjectDto
                {
                    Id = s.Id,
                    Name = s.Name
                })
                .ToListAsync();
        }
    }
}
