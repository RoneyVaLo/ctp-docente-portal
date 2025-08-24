using ctp_docente_portal.Server.DTOs.Users;

namespace ctp_docente_portal.Server.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; }
        public UserDto User { get; set; }
    }
}
