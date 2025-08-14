using ctp_docente_portal.Server.DTOs.EvaluationCategories;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IEvaluationCategoriesService
    {
        Task<List<EvaluationCategoryDto>> GetCategoriesAsync();
        Task<EvaluationCategoryDto> GetCategoryByIdAsync(int id);
    }
}
