using ctp_docente_portal.Server.DTOs.Users;

namespace ctp_docente_portal.Server.DTOs.Auth
{
    /// <summary>
    /// Response from the authentication service, containing the JWT token and the user.
    /// </summary>
    public class LoginResponseDto
    {
        /// <summary>
        /// JWT token generated for the authenticated user.
        /// </summary>
        public string Token { get; set; }

        /// <summary>
        /// Information about the authenticated user.
        /// </summary>
        public UserDto User { get; set; }
    }
}
