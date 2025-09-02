using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.DTOs.Auth;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using ctp_docente_portal.Server.DTOs.Users;

namespace ctp_docente_portal.Server.Services.Implementations
{
    /// <summary>
    /// Service responsible for authentication and generation of JWT tokens.
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;

        /// <summary>
        /// Authentication service constructor.
        /// </summary>
        /// <param name="context">Database context.</param>
        /// <param name="config">Application configuration.</param>
        /// <param name="mapper">Instance of <see cref="IMapper"/> for mapping between entities and DTOs.</param>
        public AuthService(AppDbContext context, IConfiguration config, IMapper mapper)
        {
            _context = context;
            _config = config;
            _mapper = mapper;
        }

        /// <summary>
        /// Performs a user login and returns a JWT token and User data.
        /// </summary>
        /// <param name="request">A <see cref="LoginRequestDto"/> object with the login credentials.</param>
        /// <returns>A <see cref="LoginResponseDto"/> object with the user's token and data.</returns>
        /// <exception cref="UnauthorizedAccessException">If the credentials are invalid or the user is inactive.</exception>
        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var query = from u in _context.Users
                        where u.Email == request.Email && u.isActive
                        join sul in _context.StaffUserLinks on u.Id equals sul.UserId into staffLinks
                        from sul in staffLinks.DefaultIfEmpty()
                        join sr in _context.EvaluationStaffRoles on sul.StaffId equals sr.StaffId into staffRoles
                        from sr in staffRoles.DefaultIfEmpty()
                        join r in _context.EvaluationRoles on sr.RoleId equals r.Id into roleGroup
                        from r in roleGroup.DefaultIfEmpty()
                        select new
                        {
                            User = u,
                            StaffLink = sul,
                            RoleName = r != null ? r.Name : null
                        };

            var results = await query.ToListAsync();

            if (!results.Any())
                throw new UnauthorizedAccessException("Usuario no encontrado o inactivo");

            var user = results.First().User;

            // Verificación de contraseña
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                throw new UnauthorizedAccessException("Credenciales inválidas");

            var staffLink = results.First().StaffLink;
            if (staffLink == null)
                throw new UnauthorizedAccessException("No existe relación entre usuario y staff");

            var roles = results
                .Where(r => !string.IsNullOrEmpty(r.RoleName))
                .Select(r => r.RoleName)
                .Distinct()
                .ToList();

            if (!roles.Any())
                throw new UnauthorizedAccessException("El usuario no tiene roles asignados");

            // Generar token
            var token = GenerateJwtToken(user, roles);

            return new LoginResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    Roles = roles
                }
            };
        }

        /// <summary>
        /// Generates a JWT token based on the user and their roles.
        /// </summary>
        /// <param name="user">The authenticating user.</param>
        /// <param name="roles">The roles assigned to the user.</param>
        /// <returns>The generated JWT token.</returns>
        /// <exception cref="KeyNotFoundException">If Jwt:Key is not set</exception>
        private string GenerateJwtToken(UsersModel user, IEnumerable<string> roles)
        {
            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
        };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var jwtKey = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
                throw new KeyNotFoundException("Jwt:Key no está configurado en appsettings.json");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<string> RegisterAsync(string password)
        {
            Console.WriteLine(password);
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

            return hashedPassword;
        }
    }
}
