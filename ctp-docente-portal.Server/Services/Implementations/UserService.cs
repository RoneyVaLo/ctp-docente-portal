using AutoMapper;
using AutoMapper.QueryableExtensions;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Subjects;
using ctp_docente_portal.Server.DTOs.Users;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    /// <summary>
    /// Service in charge of user management.
    /// </summary>
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        /// <summary>
        /// User Service Builder.
        /// </summary>
        /// <param name="context">Database context.</param>
        /// <param name="mapper"><see cref="IMapper"/> instance for mapping between entities and DTOs.</param>
        public UserService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Gets a user by its ID.
        /// </summary>
        /// <param name="id">The unique identifier of the user.</param>
        /// <returns>A <see cref="UserDto"/> object representing the user.</returns>
        /// <exception cref="UnauthorizedAccessException">If the user is not found or has no relationship with a staff.</exception>
        public async Task<UserDto> GetByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new UnauthorizedAccessException("Usuario no encontrado");

            var staffLink = await _context.StaffUserLinks
                .FirstOrDefaultAsync(s => s.UserId == user.Id);
            if (staffLink == null)
                throw new UnauthorizedAccessException("No existe relación entre usuario y staff");

            var roles = await _context.EvaluationStaffRoles
                .Where(r => r.StaffId == staffLink.StaffId)
                .Join(_context.EvaluationRoles,
                    sr => sr.RoleId,
                    r => r.Id,
                    (sr, r) => r.Name)
                .ToListAsync();
            if (!roles.Any())
                throw new UnauthorizedAccessException("El usuario no tiene roles asignados");

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                Roles = roles
            };

            return userDto;
        }

        public async Task<List<UserDto>> GetAllAsync()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Where(u => !_context.StaffUserLinks
                .Any(sul => sul.UserId == u.Id))
                .ToListAsync();

            return _mapper.Map<List<UserDto>>(users);
        }
    }
}
