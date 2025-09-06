using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.SectionAssignments;
using ctp_docente_portal.Server.Models;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface ISectionAssignmentsService
    {
        Task<PagedResult<SectionAssignmentDto>> GetAllAsync(PaginationParams paginationParams);
        Task<SectionAssignmentsModel> CreateAsync(SectionAssignmentCreateDto dto, int userId);
        Task<SectionAssignmentsModel> UpdateAsync(SectionAssignmentUpdateDto dto, int userId);
        Task<bool> DeleteAsync(int id);
    }
}
