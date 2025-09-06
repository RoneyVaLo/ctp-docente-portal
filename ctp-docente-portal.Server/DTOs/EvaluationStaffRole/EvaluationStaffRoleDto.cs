using ctp_docente_portal.Server.DTOs.EvaluationRole;
using ctp_docente_portal.Server.DTOs.Staff;

namespace ctp_docente_portal.Server.DTOs.EvaluationStaffRole
{
    public class EvaluationStaffRoleDto
    {
        public int Id { get; set; }
        public StaffDto Staff { get; set; }
        public EvaluationRoleDto Role { get; set; }
    }
}
