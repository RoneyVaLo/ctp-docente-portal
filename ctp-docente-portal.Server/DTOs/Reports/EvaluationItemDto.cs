namespace ctp_docente_portal.Server.DTOs.Reports
{
    public class EvaluationItemDto
    {
        public int Id { get; set; }
        public bool HasCriteria { get; set; }
        public decimal Percentage { get; set; }
        public int SubjectId { get; set; }
        public int AssignmentId { get; set; }
    }
}
