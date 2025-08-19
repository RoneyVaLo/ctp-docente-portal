namespace ctp_docente_portal.Server.DTOs.EvaluationCriteria
{
    public class EvaluationCriteriaUpdateDto
    {
        public int Id { get; set; }
        public int EvaluationItemId { get; set; }
        public string Name { get; set; }
        public decimal Weight { get; set; }
        public int UpdatedBy { get; set; }
    }
}
