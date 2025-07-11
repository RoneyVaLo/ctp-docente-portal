using ctp_docente_portal.Server.DTOs.SubjectEvaluationItems;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface ISubjectEvaluationService
    {
        Task<SubjectEvaluationItemDto> CreateAsync(SubjectEvaluationItemCreateDto dto);
        Task<SubjectEvaluationItemDto> UpdateAsync(int id, SubjectEvaluationItemUpdateDto dto);
        Task DeleteAsync(int id);
        Task<SubjectEvaluationItemDto> GetByIdAsync(int id);
        Task<List<SubjectEvaluationItemDto>> GetBySectionAssignmentAsync(int sectionAssignmentId);
        Task<int> CreateDraftEvaluationItemAsync(EvaluationItemDraftCreateDto dto);
    }
}
