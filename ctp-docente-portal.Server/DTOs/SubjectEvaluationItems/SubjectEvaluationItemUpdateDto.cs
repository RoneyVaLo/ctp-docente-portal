namespace ctp_docente_portal.Server.DTOs.SubjectEvaluationItems
{
    public class SubjectEvaluationItemUpdateDto
    {
        public string Name { get; set; }
        public decimal Percentage { get; set; }
        public bool HasCriteria { get; set; }
        public int UpdatedBy { get; set; }
    }
}
