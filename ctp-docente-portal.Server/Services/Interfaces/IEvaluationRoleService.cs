using ctp_docente_portal.Server.DTOs.EvaluationRole;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IEvaluationRoleService
    {
        Task<List<EvaluationRoleDto>> GetAllAsync();
    }
}
