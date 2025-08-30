using ctp_docente_portal.Server.DTOs.Auth;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    /// <summary>
    /// Controller that handles authentication operations.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        /// <summary>
        /// Authentication controller constructor.
        /// </summary>
        /// <param name="authService">Authentication service.</param>
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Performs a user login.
        /// </summary>
        /// <param name="request">A <see cref="LoginRequestDto"/> object with the login credentials.</param>
        /// <returns>A <see cref="LoginResponseDto"/> object with the user's token and data.</returns>
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<ActionResult<string>> Register([FromBody] string password)
        {
            var userId = await _authService.RegisterAsync(password);
            return Ok(userId);
        }
    }
}
