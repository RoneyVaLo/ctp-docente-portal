using ctp_docente_portal.Server.DTOs.EvaluationCriteria;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IEvaluationCriteriaService
    {
        Task<IEnumerable<EvaluationCriteriaDto>> CreateManyAsync(IEnumerable<EvaluationCriteriaDto> criteriaList);
        Task<IEnumerable<EvaluationCriteriaDto>> UpdateManyAsync(IEnumerable<EvaluationCriteriaDto> criteriaList);
        Task DeleteAsync(int id);
        Task<List<EvaluationCriteriaDto>> GetByEvaluationItemIdAsync(int evaluationItemId);
        Task<EvaluationCriteriaDto> GetByIdAsync(int id);
    }
}
