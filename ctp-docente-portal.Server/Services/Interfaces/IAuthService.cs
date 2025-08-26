using ctp_docente_portal.Server.DTOs.Auth;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    /// <summary>
    /// Interface for the authentication service.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Performs user login.
        /// </summary>
        /// <param name="request"><see cref="LoginRequestDto"/> object with the login credentials.</param>
        /// <returns>A <see cref="LoginResponseDto"/> object with the user's token and data.</returns>
        /// <exception cref="UnauthorizedAccessException">If the credentials are invalid or the user is inactive.</exception>
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
        Task<string> RegisterAsync(string password);
    }
}
