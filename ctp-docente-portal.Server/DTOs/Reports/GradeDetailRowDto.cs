namespace ctp_docente_portal.Server.DTOs.Reports
{
    public class GradeDetailRowDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;

        public int SectionId { get; set; }
        public string SectionName { get; set; } = string.Empty;

        public int EvaluationItemId { get; set; }
        public string EvaluationItemName { get; set; } = string.Empty;

        public double Score { get; set; }
        public double Percentage { get; set; }

        public DateTime CreatedAtUtc { get; set; }
    }
}