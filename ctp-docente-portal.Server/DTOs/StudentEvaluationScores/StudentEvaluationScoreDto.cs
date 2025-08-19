namespace ctp_docente_portal.Server.DTOs.StudentEvaluationScores
{
    public class StudentEvaluationScoreDto
    {
        public int StudentId { get; set; }
        public int EvaluationItemId { get; set; }
        public decimal Score { get; set; }
        public int UpdatedBy { get; set; }
    }
}
