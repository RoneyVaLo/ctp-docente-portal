using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.EvaluationRole;
using ctp_docente_portal.Server.DTOs.EvaluationStaffRole;
using ctp_docente_portal.Server.DTOs.Staff;
using ctp_docente_portal.Server.DTOs.StaffUserLinks;
using ctp_docente_portal.Server.DTOs.Users;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class StaffUserLinkService : IStaffUserLinkService
    {
        private readonly AppDbContext _context;

        public StaffUserLinkService(AppDbContext appDbContext)
        {
            _context = appDbContext;
        }

        public async Task<StaffUserLinksDto> CreateAsync(StaffUserLinksCreateDto createDto, int userId)
        {
            if (await _context.StaffUserLinks.AnyAsync(sul => sul.StaffId == createDto.StaffId && sul.UserId == createDto.UserId))
                throw new InvalidOperationException($"El Usuario ya está vinculado.");
            var entity = new StaffUserLinksModel
            {
                UserId = createDto.UserId,
                StaffId = createDto.StaffId,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = userId
            };

            _context.StaffUserLinks.Add(entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(entity.Id);
        }

        public async Task<IEnumerable<StaffUserLinksDto>> GetAllAsync()
        {
            var query = from sul in _context.StaffUserLinks
                        join s in _context.Staff on sul.StaffId equals s.Id
                        join u in _context.Users on sul.UserId equals u.Id
                        select new { sul, s, u };

            var results = await query.AsNoTracking().ToListAsync();
            return results.Select(x => MapToDto(x.sul, x.s, x.u));
        }

        public async Task<StaffUserLinksDto> GetByIdAsync(int id)
        {
            var query = from sul in _context.StaffUserLinks
                        join s in _context.Staff on sul.StaffId equals s.Id
                        join u in _context.Users on sul.UserId equals u.Id
                        where sul.Id == id
                        select new { sul, s, u };

            var result = await query.AsNoTracking().FirstOrDefaultAsync();

            if (result == null)
                throw new KeyNotFoundException($"No se encontró el registro con Id={id}");

            return MapToDto(result.sul, result.s, result.u);
        }

        private static StaffUserLinksDto MapToDto(
        StaffUserLinksModel s,
        StaffModel st,
        UsersModel u)
        {
            return new StaffUserLinksDto
            {
                Id = s.Id,
                Staff = new StaffDto
                {
                    Id = st.Id,
                    Name = string.Join(" ", new[]
                    {
                        st.Name,
                        st.MiddleName,
                        st.LastName,
                        st.ndLastName
                    }.Where(st => !string.IsNullOrWhiteSpace(st))),
                    Email = st.Email
                },
                User = new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    Username = u.Username
                }
            };
        }
    }
}
