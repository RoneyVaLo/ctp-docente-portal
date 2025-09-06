using AutoMapper;
using AutoMapper.QueryableExtensions;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.Subjects;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
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

        public async Task<SubjectDto> CreateSubjectAsync(CreateSubjectDto createDto, int userId)
        {
            bool existsByName = await _context.Subjects
                .AnyAsync(s => s.Name == createDto.Name);

            if (existsByName)
                throw new InvalidOperationException($"Ya existe una asignatura con el nombre '{createDto.Name}'.");

            bool existsByCode = await _context.Subjects
                .AnyAsync(s => s.Code == createDto.Code);

            if (existsByCode)
                throw new InvalidOperationException($"Ya existe una asignatura con el código '{createDto.Code}'.");

            var subject = new SubjectsModel
            {
                Name = createDto.Name,
                Code = createDto.Code,
                Description = createDto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = userId,
                UpdatedBy = userId
            };

            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();

            return _mapper.Map<SubjectDto>(subject);
        }

        public async Task<SubjectDto> UpdateSubjectAsync(int id, UpdateSubjectDto updateDto, int userId)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null)
                throw new KeyNotFoundException($"Materia con ID {id} no encontrada");

            bool existsByName = await _context.Subjects
                .AnyAsync(s => s.Name == updateDto.Name);

            if (existsByName)
                throw new InvalidOperationException($"Ya existe una asignatura con el nombre '{updateDto.Name}'.");

            bool existsByCode = await _context.Subjects
                .AnyAsync(s => s.Code == updateDto.Code);

            if (existsByCode)
                throw new InvalidOperationException($"Ya existe una asignatura con el código '{updateDto.Code}'.");

            subject.Name = updateDto.Name;
            subject.Code = updateDto.Code;
            subject.Description = updateDto.Description;
            subject.UpdatedAt = DateTime.UtcNow;
            subject.UpdatedBy = userId;

            _context.Subjects.Update(subject);
            await _context.SaveChangesAsync();

            return _mapper.Map<SubjectDto>(subject);
        }

        public async Task<SubjectDto> GetByIdAsync(int id)
        {
            var subject = await _context.Subjects.FindAsync(id);
            return _mapper.Map<SubjectDto>(subject);
        }

        public async Task<List<SubjectDto>> GetAllSubjectsAsync()
        {
            var subjects = await _context.Subjects
                .AsNoTracking()
                .ProjectTo<SubjectDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return subjects;
        }

        public async Task<PagedResult<SubjectDto>> GetAllSubjectsWithPaginationAsync(PaginationParams paginationParams)
        {
            var query = _context.Subjects
                .AsNoTracking()
                .ProjectTo<SubjectDto>(_mapper.ConfigurationProvider);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            return new PagedResult<SubjectDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize
            };
        }

        public async Task<bool> DeleteSubjectAsync(int id)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null)
                throw new KeyNotFoundException($"Materia con ID {id} no encontrada");

            bool hasAttendance = await _context.Attendances
                .AnyAsync(a => a.SubjectId == id);

            if (hasAttendance)
            {
                throw new InvalidOperationException("No se puede eliminar la materia porque tiene asistencias registradas.");
            }

            bool hasAssignments = await _context.SectionAssignments
                .AnyAsync(sa => sa.SubjectId == id);

            if (hasAssignments)
            {
                throw new InvalidOperationException("No se puede eliminar la materia porque está asignada a una sección.");
            }

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<SubjectDto>> GetSubjectsByPeriodAsync(int academicPeriodId, int userId)
        {
            int staffId = await _context.StaffUserLinks
                .Where(x => x.UserId == userId)
                .Select(x => x.StaffId)
                .FirstOrDefaultAsync();
            if (staffId == 0)
            {
                throw new KeyNotFoundException($"Usuario con ID {userId} no encontrado");
            }

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
                .ProjectTo<SubjectDto>(_mapper.ConfigurationProvider)
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
