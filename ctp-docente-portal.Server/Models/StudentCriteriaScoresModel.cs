namespace ctp_docente_portal.Server.Models
{
    public class StudentCriteriaScoresModel
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int EvaluationItemId { get; set; } // FK a SubjectEvaluationItemsModel (para agrupación)
        public int CriteriaId { get; set; } // FK a EvaluationCriteriaModel
        public decimal Score { get; set; } // Nota del estudiante en este criterio específico
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
