namespace ctp_docente_portal.Server.DTOs.EvaluationCriteria
{
    public class EvaluationCriteriaCreateDto
    {
        public int EvaluationItemId { get; set; }
        public string Name { get; set; }
        public decimal Weight { get; set; }
        public int CreatedBy { get; set; }
    }
}
