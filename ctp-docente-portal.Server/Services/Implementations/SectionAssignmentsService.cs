using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.SectionAssignments;
using ctp_docente_portal.Server.Helpers;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class SectionAssignmentsService : ISectionAssignmentsService
    {
        private readonly AppDbContext _context;

        public SectionAssignmentsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<SectionAssignmentDto>> GetAllAsync(PaginationParams paginationParams)
        {
            var query =
            from sa in _context.SectionAssignments
            join st in _context.Staff on sa.StaffId equals st.Id
            join su in _context.Subjects on sa.SubjectId equals su.Id
            join se in _context.Sections on sa.SectionId equals se.Id
            join ap in _context.AcademicPeriods on sa.AcademicPeriodId equals ap.Id
            select new SectionAssignmentDto
            {
                Id = sa.Id,
                Teacher = new SimpleDto
                {
                    Id = st.Id,
                    Name = $"{st.Name ?? ""} {st.MiddleName ?? ""} {st.LastName ?? ""} {st.ndLastName ?? ""}".Trim()
                },
                Subject = new SimpleDto { Id = su.Id, Name = su.Name },
                Section = new SimpleDto { Id = se.Id, Name = se.Name },
                SubSection = new SimpleDto
                {
                    Id = sa.SubSectionId,
                    Name = ((SubSections)sa.SubSectionId).ToString()
                },
                Period = new SimpleDto { Id = ap.Id, Name = ap.Name }
            };

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(x => x.Section.Id)
                .ThenBy(x => x.Subject.Name)
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            return new PagedResult<SectionAssignmentDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize
            };
        }

        public async Task<SectionAssignmentsModel> CreateAsync(SectionAssignmentCreateDto dto, int userId)
        {
            if (dto.Teacher.Id <= 0 || dto.Subject.Id <= 0 || dto.Section.Id <= 0 || dto.Period.Id <= 0)
                throw new ArgumentException("Todos los campos obligatorios deben tener Id válido.");

            bool exists = await _context.SectionAssignments
                .AnyAsync(s => s.SubjectId == dto.Subject.Id && s.SectionId == dto.Section.Id && s.AcademicPeriodId == dto.Period.Id);

            if (exists)
                throw new InvalidOperationException($"Ya existe una asignación para la materia '{dto.Subject.Name}' en la sección '{dto.Section.Name}'.");

            var entity = new SectionAssignmentsModel
            {
                StaffId = dto.Teacher.Id,
                SubjectId = dto.Subject.Id,
                SectionId = dto.Section.Id,
                SubSectionId = dto.SubSection.Id,
                AcademicPeriodId = dto.Period.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = userId,
                UpdatedBy = userId
            };

            _context.SectionAssignments.Add(entity);
            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<SectionAssignmentsModel> UpdateAsync(SectionAssignmentUpdateDto dto, int userId)
        {
            var entity = await _context.SectionAssignments.FindAsync(dto.Id);
            if (entity == null)
                throw new KeyNotFoundException($"No se encontró la asignación con Id {dto.Id}");

            if (dto.Teacher.Id <= 0 || dto.Subject.Id <= 0 || dto.Section.Id <= 0 || dto.Period.Id <= 0)
                throw new ArgumentException("Todos los campos obligatorios deben tener Id válido.");

            bool hasEvaluationItems = await _context.EvaluationItems
                .AnyAsync(e => e.SectionAssignmentId == dto.Id);

            if (hasEvaluationItems)
            {
                if (entity.SubjectId != dto.Subject.Id ||
                    entity.SectionId != dto.Section.Id ||
                    entity.SubSectionId != dto.SubSection.Id ||
                    entity.AcademicPeriodId != dto.Period.Id)
                {
                    throw new InvalidOperationException(
                        "No se pueden modificar los campos de la asignación porque ya existen items de evaluación asociados. " +
                        "\nSolo se permite cambiar el docente (StaffId).");
                }

                entity.StaffId = dto.Teacher.Id;
            }
            else
            {
                entity.StaffId = dto.Teacher.Id;
                entity.SubjectId = dto.Subject.Id;
                entity.SectionId = dto.Section.Id;
                entity.SubSectionId = dto.SubSection.Id;
                entity.AcademicPeriodId = dto.Period.Id;
            }

            _context.SectionAssignments.Update(entity);
            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.SectionAssignments.FindAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"No se encontró la asignación con Id {id}");

            bool hasEvaluationItems = await _context.EvaluationItems
                .AnyAsync(e => e.SectionAssignmentId == id);

            if (hasEvaluationItems)
                throw new InvalidOperationException("No se puede eliminar la asignación porque tiene items de evaluación asociados.");

            _context.SectionAssignments.Remove(entity);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
