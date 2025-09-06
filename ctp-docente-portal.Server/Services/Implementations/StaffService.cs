using AutoMapper;
using AutoMapper.QueryableExtensions;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Staff;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class StaffService : IStaffService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public StaffService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<StaffDto>> GetAllAsync()
        {
            var staff = await (from s in _context.Staff
                               join sr in _context.EvaluationStaffRoles on s.Id equals sr.StaffId into staffRoles
                               from sr in staffRoles.DefaultIfEmpty()
                               join r in _context.EvaluationRoles on sr.RoleId equals r.Id into roles
                               from r in roles.DefaultIfEmpty()
                               group r by new { s.Id, s.Name, s.MiddleName, s.LastName, s.ndLastName, s.Email } into g
                               select new StaffDto
                               {
                                   Id = g.Key.Id,
                                   Name = $"{g.Key.Name ?? ""} {g.Key.MiddleName ?? ""} {g.Key.LastName ?? ""} {g.Key.ndLastName ?? ""}".Trim(),
                                   Email = g.Key.Email,
                                   Roles = g.Where(x => x != null)
                                            .Select(x => x.Name)
                                            .ToList()
                               })
           .AsNoTracking()
           .ToListAsync();

            return staff;
        }

        public async Task<StaffDto> GetByIdAsync(int id)
        {
            var staff = await _context.Staff.FindAsync(id);
            return _mapper.Map<StaffDto>(staff);
        }
    }
}
