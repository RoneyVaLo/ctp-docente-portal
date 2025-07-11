namespace ctp_docente_portal.Server.DTOs.SubjectEvaluationItems
{
    public class SubjectEvaluationItemDto
    {
        public int Id { get; set; }
        public int SectionAssignmentId { get; set; }
        public string Name { get; set; }
        public decimal Percentage { get; set; }
        public bool HasCriteria { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
