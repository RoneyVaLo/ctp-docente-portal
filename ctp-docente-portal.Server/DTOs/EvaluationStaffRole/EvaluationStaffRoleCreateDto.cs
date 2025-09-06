using ctp_docente_portal.Server.DTOs.Common;

namespace ctp_docente_portal.Server.DTOs.EvaluationStaffRole
{
    public class EvaluationStaffRoleCreateDto
    {
        public SimpleDto Staff { get; set; }
        public SimpleDto Role { get; set; }
    }
}
