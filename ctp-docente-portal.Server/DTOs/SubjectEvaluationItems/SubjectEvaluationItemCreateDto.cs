namespace ctp_docente_portal.Server.DTOs.SubjectEvaluationItems
{
    public class SubjectEvaluationItemCreateDto
    {
        public int SectionAssignmentId { get; set; }
        public string Name { get; set; }
        public decimal Percentage { get; set; }
        public bool HasCriteria { get; set; }
        public int CreatedBy { get; set; }
    }
}
