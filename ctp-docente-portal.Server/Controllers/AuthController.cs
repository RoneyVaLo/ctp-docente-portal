using ctp_docente_portal.Server.DTOs.Auth;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

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
