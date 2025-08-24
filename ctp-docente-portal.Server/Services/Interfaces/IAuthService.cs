using ctp_docente_portal.Server.DTOs.Auth;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
        Task<string> RegisterAsync(string password);
    }
}
