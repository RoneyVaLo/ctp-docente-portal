using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.EvaluationRole;
using ctp_docente_portal.Server.DTOs.EvaluationStaffRole;
using ctp_docente_portal.Server.DTOs.Staff;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class EvaluationStaffRoleService : IEvaluationStaffRoleService
    {
        private readonly AppDbContext _context;

        public EvaluationStaffRoleService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<EvaluationStaffRoleDto> CreateAsync(EvaluationStaffRoleCreateDto dto, int userId)
        {
            if (dto.Staff.Id <= 0) throw new ArgumentException("StaffId debe ser mayor a 0");
            if (dto.Role.Id <= 0) throw new ArgumentException("RoleId debe ser mayor a 0");
            if (await _context.EvaluationStaffRoles.AnyAsync(esr => esr.StaffId == dto.Staff.Id && esr.RoleId == dto.Role.Id))
                throw new InvalidOperationException($"El Usuario ya tiene ese rol asignado.");

            var entity = new EvaluationStaffRolesModel
            {
                StaffId = dto.Staff.Id,
                RoleId = dto.Role.Id,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = userId
            };

            _context.EvaluationStaffRoles.Add(entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(entity.Id);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.EvaluationStaffRoles.FindAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"No se encontró el registro con Id={id}");

            _context.EvaluationStaffRoles.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<EvaluationStaffRoleDto>> GetAllAsync()
        {
            var query =
            from e in _context.EvaluationStaffRoles
            join s in _context.Staff on e.StaffId equals s.Id
            join r in _context.EvaluationRoles on e.RoleId equals r.Id
            select new { e, s, r };

            var results = await query.AsNoTracking().ToListAsync();
            return results.Select(x => MapToDto(x.e, x.s, x.r));
        }

        public async Task<PagedResult<EvaluationStaffRoleDto>> GetAllWithPaginationAsync(PaginationParams paginationParams)
        {
            var query = from e in _context.EvaluationStaffRoles
                        join s in _context.Staff on e.StaffId equals s.Id
                        join r in _context.EvaluationRoles on e.RoleId equals r.Id
                        select new { e, s, r };

            var totalCount = await query.CountAsync();

            var results = await query
                .AsNoTracking()
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            var items = results.Select(x => MapToDto(x.e, x.s, x.r)).ToList();

            return new PagedResult<EvaluationStaffRoleDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize
            };
        }

        public async Task<EvaluationStaffRoleDto> GetByIdAsync(int id)
        {
            var query =
            from e in _context.EvaluationStaffRoles
            join s in _context.Staff on e.StaffId equals s.Id
            join r in _context.EvaluationRoles on e.RoleId equals r.Id
            where e.Id == id
            select new { e, s, r };

            var result = await query.AsNoTracking().FirstOrDefaultAsync();

            if (result == null)
                throw new KeyNotFoundException($"No se encontró el registro con Id={id}");

            return MapToDto(result.e, result.s, result.r);
        }

        public async Task<EvaluationStaffRoleDto> UpdateAsync(int id, EvaluationStaffRoleUpdateDto dto, int userId)
        {
            var entity = await _context.EvaluationStaffRoles.FindAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"No se encontró el registro con Id={id}");

            if (dto.Role.Id <= 0) throw new ArgumentException("RoleId debe ser mayor a 0");

            entity.RoleId = dto.Role.Id;
            entity.UpdatedBy = userId;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(entity.Id);
        }

        private static EvaluationStaffRoleDto MapToDto(
        EvaluationStaffRolesModel e,
        StaffModel s,
        EvaluationRolesModel r)
        {
            return new EvaluationStaffRoleDto
            {
                Id = e.Id,
                Staff = new StaffDto
                {
                    Id = s.Id,
                    Name = string.Join(" ", new[]
                    {
                        s.Name,
                        s.MiddleName,
                        s.LastName,
                        s.ndLastName
                    }.Where(s => !string.IsNullOrWhiteSpace(s))),
                    Email = s.Email
                },
                Role = new EvaluationRoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description
                }
            };
        }
    }
}
