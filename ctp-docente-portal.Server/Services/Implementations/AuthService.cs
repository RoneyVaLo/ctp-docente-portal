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
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;

        public AuthService(AppDbContext context, IConfiguration config, IMapper mapper)
        {
            _context = context;
            _config = config;
            _mapper = mapper;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.isActive);

            if (user == null)
                throw new UnauthorizedAccessException("Usuario no encontrado o inactivo");


            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                throw new UnauthorizedAccessException("Credenciales inválidas");

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
          
            var token = GenerateJwtToken(user, roles);

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                Roles = roles
            };

            return new LoginResponseDto
            {
                Token = token,
                User = userDto
            };
        }

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
