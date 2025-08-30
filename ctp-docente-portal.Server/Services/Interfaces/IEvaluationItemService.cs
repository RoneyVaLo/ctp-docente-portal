using ctp_docente_portal.Server.DTOs.EvaluationItems;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IEvaluationItemService
    {
        Task<EvaluationItemDto> CreateAsync(EvaluationItemCreateDto dto);
        Task<EvaluationItemDto> UpdateAsync(int id, EvaluationItemUpdateDto dto);
        Task DeleteAsync(int id);
        Task<EvaluationItemDto> GetByIdAsync(int id);
        Task<EvaluationItemDetailsDto> GetDetailsByIdAsync(int id, int? studentId = null);
        Task<List<EvaluationItemDto>> GetItemsBySubjectAndSectionAsync(int subjectId, int sectionId);
        Task<int> CreateDraftEvaluationItemAsync(EvaluationItemDraftCreateDto dto);
    }
}
