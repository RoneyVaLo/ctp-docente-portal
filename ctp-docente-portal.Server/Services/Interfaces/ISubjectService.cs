using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.Subjects;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface ISubjectService
    {
        Task<SubjectDto> CreateSubjectAsync(CreateSubjectDto createDto, int userId);
        Task<SubjectDto> UpdateSubjectAsync(int id, UpdateSubjectDto updateDto, int userId);
        Task<SubjectDto> GetByIdAsync(int id);
        Task<List<SubjectDto>> GetAllSubjectsAsync();
        Task<PagedResult<SubjectDto>> GetAllSubjectsWithPaginationAsync(PaginationParams paginationParams);
        Task<bool> DeleteSubjectAsync(int id);
        Task<List<SubjectDto>> GetSubjectsByPeriodAsync(int academicPeriodId, int userId);
    }
}
