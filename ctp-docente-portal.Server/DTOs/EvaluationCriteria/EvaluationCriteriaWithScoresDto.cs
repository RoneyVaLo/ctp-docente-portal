using ctp_docente_portal.Server.DTOs.Students;

namespace ctp_docente_portal.Server.DTOs.EvaluationCriteria
{
    public class EvaluationCriteriaWithScoresDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Weight { get; set; }
        public List<StudentScoreDto> StudentScores { get; set; }
    }
}
