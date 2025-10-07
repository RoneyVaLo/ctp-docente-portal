using ctp_docente_portal.Server.DTOs.EvaluationCriteria;

namespace ctp_docente_portal.Server.DTOs.EvaluationItems
{
    public class EvaluationItemCreateDto
    {
        public int Id { get; set; }
        public int SectionAssignmentId { get; set; }
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public int CategoryId { get; set; }
        public string EvaluationCategoryName { get; set; } = "";
        public decimal Percentage { get; set; }
        public bool HasCriteria { get; set; }
        public List<EvaluationCriteriaDto>? Criteria { get; set; }
    }
}
