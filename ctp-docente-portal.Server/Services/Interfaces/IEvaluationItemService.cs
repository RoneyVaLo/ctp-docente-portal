using ctp_docente_portal.Server.DTOs.EvaluationItems;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IEvaluationItemService
    {
        Task<EvaluationItemDto> CreateAsync(int userId, EvaluationItemCreateDto dto);
        Task<EvaluationItemDto> UpdateAsync(int userId, int id, EvaluationItemUpdateDto dto);
        Task DeleteAsync(int id);
        Task<EvaluationItemDto> GetByIdAsync(int id);
        Task<EvaluationItemDetailsDto> GetDetailsByIdAsync(int id, int userId, int? studentId = null);
        Task<List<EvaluationItemDto>> GetItemsBySubjectAndSectionAsync(int subjectId, int sectionId, int userId);
        Task<int> CreateDraftEvaluationItemAsync(EvaluationItemDraftCreateDto dto);
    }
}
