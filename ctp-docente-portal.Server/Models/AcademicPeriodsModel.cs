namespace ctp_docente_portal.Server.Models
{
    public class AcademicPeriodsModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int EnrollmentId { get; set; }
        public DateTime Year { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
