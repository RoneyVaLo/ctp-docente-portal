using ctp_docente_portal.Server.Models;

namespace ctp_docente_portal.Server.DTOs.Users
{
    public class UserWithRoleDto
    {
        public UsersModel User { get; set; }
        public StaffUserLinksModel? StaffLink { get; set; }
        public string? RoleName { get; set; }
    }
}
