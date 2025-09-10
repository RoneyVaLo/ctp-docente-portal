using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Auth;
using ctp_docente_portal.Server.DTOs.Users;
using ctp_docente_portal.Server.Helpers;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

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
        private readonly EncryptionService _encryptionService;

        /// <summary>
        /// Authentication service constructor.
        /// </summary>
        /// <param name="context">Database context.</param>
        /// <param name="config">Application configuration.</param>
        /// <param name="mapper">Instance of <see cref="IMapper"/> for mapping between entities and DTOs.</param>
        public AuthService(AppDbContext context, IConfiguration config, IMapper mapper, EncryptionService encryptionService)
        {
            _context = context;
            _config = config;
            _mapper = mapper;
            _encryptionService = encryptionService;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var results = await GetUserWithRolesAsync(request.Email);

            if (!results.Any())
                throw new UnauthorizedAccessException("Usuario no encontrado o inactivo");

            var user = results.First().User;

            await CheckLoginAttemptsAsync(user.Id);

            ValidatePassword(user.Password, request.Password, user.Id);

            var staffLink = results.First().StaffLink;
            if (staffLink == null)
                throw new UnauthorizedAccessException("No existe relación entre usuario y staff");

            var roles = ExtractRoles(results);
            if (!roles.Any())
                throw new UnauthorizedAccessException("El usuario no tiene roles asignados");

            await ResetLoginAttemptsAsync(user.Id);

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
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<List<UserWithRoleDto>> GetUserWithRolesAsync(string email)
        {
            return await (from u in _context.Users
                          where u.Email == email && u.isActive
                          join sul in _context.StaffUserLinks on u.Id equals sul.UserId into staffLinks
                          from sul in staffLinks.DefaultIfEmpty()
                          join sr in _context.EvaluationStaffRoles on sul.StaffId equals sr.StaffId into staffRoles
                          from sr in staffRoles.DefaultIfEmpty()
                          join r in _context.EvaluationRoles on sr.RoleId equals r.Id into roleGroup
                          from r in roleGroup.DefaultIfEmpty()
                          select new UserWithRoleDto
                          {
                              User = u,
                              StaffLink = sul,
                              RoleName = r != null ? r.Name : null
                          }).ToListAsync();
        }

        private async Task CheckLoginAttemptsAsync(int userId)
        {
            var attempt = await _context.LoginAttempts
                .FirstOrDefaultAsync(a => a.UserId == userId);

            if (attempt != null && attempt.LockedUntil.HasValue && attempt.LockedUntil > DateTime.UtcNow)
            {
                var remaining = attempt.LockedUntil.Value - DateTime.UtcNow;

                string message;
                if (remaining.TotalMinutes >= 1)
                {
                    message = $"La cuenta está bloqueada. Intente en {remaining.Minutes} minutos.";
                }
                else
                {
                    message = $"La cuenta está bloqueada. Intente en {remaining.Seconds} segundos.";
                }

                throw new UnauthorizedAccessException(message);
            }
        }

        private void ValidatePassword(string encryptedPassword, string providedPassword, int userId)
        {
            string decryptedPassword;
            try
            {
                decryptedPassword = _encryptionService.Decrypt(encryptedPassword);
            }
            catch (CryptographicException)
            {
                throw new UnauthorizedAccessException("Contraseña corrupta o formato inválido");
            }

            if (providedPassword != decryptedPassword)
            {
                RegisterFailedAttempt(userId).GetAwaiter().GetResult();
                throw new UnauthorizedAccessException("Credenciales inválidas");
            }
        }

        private async Task RegisterFailedAttempt(int userId)
        {
            var now = DateTime.UtcNow;
            var attempt = await _context.LoginAttempts.FirstOrDefaultAsync(a => a.UserId == userId);

            if (attempt == null)
            {
                attempt = new LoginAttempts
                {
                    UserId = userId,
                    Attempts = 1,
                    LastAttempt = now
                };
                _context.LoginAttempts.Add(attempt);
            }
            else
            {
                attempt.Attempts++;
                attempt.LastAttempt = now;

                if (attempt.Attempts >= 3)
                {
                    attempt.LockedUntil = now.AddMinutes(1);
                }

                _context.LoginAttempts.Update(attempt);
            }

            await _context.SaveChangesAsync();
        }

        private async Task ResetLoginAttemptsAsync(int userId)
        {
            var attempt = await _context.LoginAttempts.FirstOrDefaultAsync(a => a.UserId == userId);
            if (attempt != null)
            {
                _context.LoginAttempts.Remove(attempt);
                await _context.SaveChangesAsync();
            }
        }

        private List<string> ExtractRoles(IEnumerable<UserWithRoleDto> results)
        {
            return results
                .Where(r => !string.IsNullOrEmpty(r.RoleName))
                .Select(r => r.RoleName)
                .Distinct()
                .ToList();
        }

        public async Task<string> RegisterAsync(string password)
        {
            var encryptedPassword = _encryptionService.Encrypt(password);
            return encryptedPassword;
        }
    }
}
