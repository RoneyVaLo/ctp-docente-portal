using Microsoft.AspNetCore.Http.HttpResults;

namespace ctp_docente_portal.Server.DTOs.EvaluationCriteria
{
    public class EvaluationCriteriaDto
    {
        public int Id { get; set; }
        public int EvaluationItemId { get; set; }
        public string Name { get; set; }
        public decimal Weight { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
