using ctp_docente_portal.Server.DTOs.EvaluationCriteria;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IEvaluationCriteriaService
    {
        Task<EvaluationCriteriaDto> CreateAsync(EvaluationCriteriaCreateDto dto);
        Task<EvaluationCriteriaDto> UpdateAsync(int id, EvaluationCriteriaUpdateDto dto);
        Task DeleteAsync(int id);
        Task<List<EvaluationCriteriaDto>> GetByEvaluationItemIdAsync(int evaluationItemId);
        Task<EvaluationCriteriaDto> GetByIdAsync(int id);
    }
}
