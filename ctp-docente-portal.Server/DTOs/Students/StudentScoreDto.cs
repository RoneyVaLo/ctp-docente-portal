namespace ctp_docente_portal.Server.DTOs.Students
{
    public class StudentScoreDto
    {
        public int StudentId { get; set; }
        public int EvaluationItemId { get; set; }
        public decimal Score { get; set; }
        public int UpdatedBy { get; set; }
    }
}
