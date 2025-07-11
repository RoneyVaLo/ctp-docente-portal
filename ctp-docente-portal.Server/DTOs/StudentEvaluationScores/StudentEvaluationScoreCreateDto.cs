namespace ctp_docente_portal.Server.DTOs.StudentEvaluationScores
{
    public class StudentEvaluationScoreCreateDto
    {
        public int StudentId { get; set; }
        public int EvaluationCriteriaId { get; set; }
        public decimal Score { get; set; }
    }
}
