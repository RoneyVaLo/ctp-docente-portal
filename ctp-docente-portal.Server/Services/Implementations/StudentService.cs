using AutoMapper;
using AutoMapper.QueryableExtensions;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Students;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class StudentService : IStudentService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public StudentService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<StudentDto>> GetStudentsBySectionAsync(int sectionId, int userId)
        {
            int staffId = await _context.StaffUserLinks
                .Where(x => x.UserId == userId)
                .Select(x => x.StaffId)
                .FirstOrDefaultAsync();

            if (staffId == 0)
            {
                throw new KeyNotFoundException($"Usuario con ID {userId} no encontrado");
            }

            // Validación de asignación de sección
            bool isAssigned = await _context.SectionAssignments
                .AsNoTracking()
                .AnyAsync(sa => sa.SectionId == sectionId && sa.StaffId == staffId);

            if (!isAssigned)
            {
                throw new UnauthorizedAccessException("El profesor no tiene acceso a esta sección.");
            }

            // Proyección directa a DTO con AutoMapper
            var students = await _context.SectionStudents
                .AsNoTracking()
                .Where(ss => ss.SectionId == sectionId && ss.isActive)
                .Join(
                _context.Students.Where(s => s.isActive),
                ss => ss.StudentId,
                s => s.Id,
                (ss, s) => s
                )
                .OrderBy(s => s.LastName)
                .ToListAsync();

            // Mapeo en memoria con AutoMapper (evita errores SQL)
            var studentDtos = _mapper.Map<List<StudentDto>>(students);
            return studentDtos;
        }
    }
}
