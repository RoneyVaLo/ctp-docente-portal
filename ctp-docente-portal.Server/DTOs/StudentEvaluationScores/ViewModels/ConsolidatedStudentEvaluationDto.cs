namespace ctp_docente_portal.Server.DTOs.StudentEvaluationScores.ViewModels
{
    public class ConsolidatedStudentEvaluationDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public Dictionary<string, decimal?> ScoresByCriteria { get; set; } = new();
        public decimal? FinalAverage { get; set; }
    }
}
