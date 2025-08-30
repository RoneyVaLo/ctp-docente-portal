namespace ctp_docente_portal.Server.DTOs.Auth
{
    /// <summary>
    /// Data required for the login process.
    /// </summary>
    public class LoginRequestDto
    {
        /// <summary>
        /// User email.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// User password.
        /// </summary>
        public string Password { get; set; }
    }
}
