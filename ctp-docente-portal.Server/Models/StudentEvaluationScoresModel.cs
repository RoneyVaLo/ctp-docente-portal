namespace ctp_docente_portal.Server.Models
{
    public class StudentEvaluationScoresModel
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int EvaluationItemId { get; set; } // Referencia al ítem de evaluación
        public decimal Score { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
