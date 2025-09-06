using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.Staff;
using ctp_docente_portal.Server.DTOs.Users;

namespace ctp_docente_portal.Server.DTOs.StaffUserLinks
{
    public class StaffUserLinksDto
    {
        public int Id { get; set; }
        public StaffDto Staff { get; set; }
        public UserDto User { get; set; }
    }
}
