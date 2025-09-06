using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.EvaluationStaffRole;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IEvaluationStaffRoleService
    {
        Task<EvaluationStaffRoleDto> GetByIdAsync(int id);
        Task<IEnumerable<EvaluationStaffRoleDto>> GetAllAsync();
        Task<PagedResult<EvaluationStaffRoleDto>> GetAllWithPaginationAsync(PaginationParams paginationParams);
        Task<EvaluationStaffRoleDto> CreateAsync(EvaluationStaffRoleCreateDto dto, int userId);
        Task<EvaluationStaffRoleDto> UpdateAsync(int id, EvaluationStaffRoleUpdateDto dto, int userId);
        Task DeleteAsync(int id);
    }
}
