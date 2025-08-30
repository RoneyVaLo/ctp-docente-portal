namespace ctp_docente_portal.Server.DTOs.StudentEvaluationScores
{
    public class StudentEvaluationMatrixDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public Dictionary<int, decimal?> ScoresByItemId { get; set; }
    }
}
