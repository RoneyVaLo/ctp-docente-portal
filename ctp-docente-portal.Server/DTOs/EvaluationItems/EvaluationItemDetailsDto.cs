using ctp_docente_portal.Server.DTOs.EvaluationCriteria;
using ctp_docente_portal.Server.DTOs.Students;

namespace ctp_docente_portal.Server.DTOs.EvaluationItems
{
    public class EvaluationItemDetailsDto
    {
        public int Id { get; set; }
        public string ItemName { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal Percentage { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string SubjectName { get; set; } = "";
        public string SectionName { get; set; } = "";
        public string EvaluationCategoryName { get; set; } = "";
        public string Status { get; set; } = "";
        public List<StudentScoreCriteriaDto> StudentScores { get; set; } = new List<StudentScoreCriteriaDto>();
        public List<EvaluationCriteriaDto> Criteria { get; set; } = new List<EvaluationCriteriaDto> { new EvaluationCriteriaDto() };
    }
}
