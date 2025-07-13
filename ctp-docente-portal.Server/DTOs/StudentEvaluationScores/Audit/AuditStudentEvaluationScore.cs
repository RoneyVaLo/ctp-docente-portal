namespace ctp_docente_portal.Server.DTOs.StudentEvaluationScores.Audit
{
    public class AuditStudentEvaluationScore
    {
        public int Id { get; set; }
        public int OriginalId { get; set; } // ID del registro original
        public int UserId { get; set; }
        public string Action { get; set; } = string.Empty; // e.g. "Update", "Insert"
        public DateTime TrackedDate { get; set; }

        public decimal? Score { get; set; }
        public string? LiteralScore { get; set; }
    }
}
