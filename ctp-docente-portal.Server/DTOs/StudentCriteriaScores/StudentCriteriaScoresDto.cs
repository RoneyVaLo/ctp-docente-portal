namespace ctp_docente_portal.Server.DTOs.StudentCriteriaScores
{
    public class StudentCriteriaScoresDto
    {
        public int StudentId { get; set; }
        public int EvaluationItemId { get; set; }
        public int CriteriaId { get; set; }
        public decimal Score { get; set; }
        public int UpdatedBy { get; set; }
    }
}
