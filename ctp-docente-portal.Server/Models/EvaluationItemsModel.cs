namespace ctp_docente_portal.Server.Models
{
    public class EvaluationItemsModel
    {
        public int Id { get; set; }
        public int SectionAssignmentId { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; }
        public decimal Percentage { get; set; }
        public bool HasCriteria { get; set; } // Indica si el ítem usa rúbrica/criterios
        public bool IsDraft { get; set; } // <--- NUEVO
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
