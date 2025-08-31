using System.ComponentModel.DataAnnotations.Schema;

namespace ctp_docente_portal.Server.Models
{
    [Table("Sections")]
    public class SectionModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public int Size { get; set; }
        public int EnrollmentId { get; set; }
        public int GradeId { get; set; }
        public int? SpecialityIdSubA { get; set; }
        public int? SpecialityIdSubB { get; set; }

        [Column("isActive")]
        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
