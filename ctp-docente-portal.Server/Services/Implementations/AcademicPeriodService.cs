using AutoMapper;
using AutoMapper.QueryableExtensions;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.AcademicPeriod;
using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class AcademicPeriodService : IAcademicPeriodService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public AcademicPeriodService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AcademicPeriodDto>> GetAllAsync()
        {
            var query =
                from ap in _context.AcademicPeriods.AsNoTracking()
                join e in _context.Enrollments.AsNoTracking()
                on ap.EnrollmentId equals e.Id
                orderby ap.StartDate
                select new AcademicPeriodDto
                {
                    Id = ap.Id,
                    Name = ap.Name,
                    StartDate = ap.StartDate,
                    EndDate = ap.EndDate,
                    IsActive = ap.IsActive,
                    Enrollment = new SimpleDto
                    {
                        Id = e.Id,
                        Name = e.Name
                    }
                };

            return await query.ToListAsync();
        }

        public async Task<PagedResult<AcademicPeriodDto>> GetAllWithPaginationAsync(PaginationParams paginationParams)
        {
            var query = from ap in _context.AcademicPeriods.AsNoTracking()
                        join e in _context.Enrollments.AsNoTracking() on ap.EnrollmentId equals e.Id
                        orderby ap.StartDate
                        select new AcademicPeriodDto
                        {
                            Id = ap.Id,
                            Name = ap.Name,
                            StartDate = ap.StartDate,
                            EndDate = ap.EndDate,
                            IsActive = ap.IsActive,
                            Enrollment = new SimpleDto
                            {
                                Id = e.Id,
                                Name = e.Name
                            }
                        };

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            return new PagedResult<AcademicPeriodDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize
            };
        }

        public async Task<AcademicPeriodDto> GetByIdAsync(int id)
        {
            var entity = await _context.AcademicPeriods.FindAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"Periodo Académico con ID {id} no encontrado");
            return _mapper.Map<AcademicPeriodDto>(entity);
        }

        public async Task<AcademicPeriodDto> CreateAsync(CreateAcademicPeriodDto dto, int userId)
        {
            if (dto.StartDate >= dto.EndDate)
                throw new InvalidOperationException("La fecha de inicio no puede ser mayor o igual a la fecha de fin.");

            bool exists = await _context.AcademicPeriods
                .AnyAsync(p => p.Name == dto.Name && p.EnrollmentId == dto.Enrollment.Id);

            if (exists)
                throw new InvalidOperationException($"Ya existe un periodo académico con el nombre '{dto.Name}' para la matrícula '{dto.Enrollment.Name}'.");

            var entity = _mapper.Map<AcademicPeriodsModel>(dto);
            entity.EnrollmentId = dto.Enrollment.Id;
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.CreatedBy = userId;
            entity.UpdatedBy = userId;

            _context.AcademicPeriods.Add(entity);
            await _context.SaveChangesAsync();

            return _mapper.Map<AcademicPeriodDto>(entity);
        }

        public async Task<AcademicPeriodDto> UpdateAsync(int id, UpdateAcademicPeriodDto dto, int userId)
        {
            var entity = await _context.AcademicPeriods.FindAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"Periodo Académico con ID {id} no encontrado");

            bool isPastPeriod = entity.EndDate < DateTime.UtcNow;

            if (isPastPeriod)
            {
                if (dto.IsActive != false ||
                    entity.Name != dto.Name ||
                    entity.StartDate != dto.StartDate ||
                    entity.EndDate != dto.EndDate ||
                    entity.EnrollmentId != dto.Enrollment?.Id)
                {
                    throw new InvalidOperationException("No se pueden modificar periodos pasados. Solo se permite desactivarlos.");
                }
            }
            else
            {
                if (dto.StartDate.Date >= dto.EndDate.Date)
                    throw new InvalidOperationException("La fecha de inicio no puede ser mayor o igual a la fecha de fin.");

                bool exists = await _context.AcademicPeriods
                    .AnyAsync(p => p.Id != id && p.Name == dto.Name && p.EnrollmentId == dto.Enrollment.Id);

                if (exists)
                    throw new InvalidOperationException($"Ya existe un periodo académico con el nombre '{dto.Name}' para la matrícula '{dto.Enrollment.Name}'.");
            }

            if (!isPastPeriod)
            {
                _mapper.Map(dto, entity);
                entity.EnrollmentId = dto.Enrollment.Id;
            }
            else
            {
                entity.IsActive = false;
            }

            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedBy = userId;

            await _context.SaveChangesAsync();
            return _mapper.Map<AcademicPeriodDto>(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.AcademicPeriods.FindAsync(id);
            if (entity == null)
            {
                throw new KeyNotFoundException($"Periodo Académico con ID {id} no encontrado");
            }

            bool hasAssignments = await _context.SectionAssignments
                .AnyAsync(sa => sa.AcademicPeriodId == id);

            if (hasAssignments)
            {
                throw new InvalidOperationException("No se puede eliminar el periodo porque tiene asignaciones.");
            }

            if (entity.IsActive)
            {
                throw new InvalidOperationException("No se puede eliminar el periodo porque está activo.");
            }

            if (entity.StartDate <= DateTime.UtcNow)
            {
                throw new InvalidOperationException("No se puede eliminar el periodo porque es historico.");
            }

            _context.AcademicPeriods.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
