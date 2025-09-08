using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ctp_docente_portal.Server.Models
{
    [Table("EnrollmentStudent", Schema = "public")]
    public class EnrollmentStudentModel
    {
        [Key]
        public int Id { get; set; }

        public int EnrollmentId { get; set; }
        public int StudentId { get; set; }
        public int? GradeId { get; set; }

        [Column("isActive")]
        public bool? IsActive { get; set; } = true;

        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }

        [ForeignKey(nameof(EnrollmentId))]
        public EnrollmentsModel? Enrollment { get; set; }

        [ForeignKey(nameof(StudentId))]
        public StudentsModel? Student { get; set; }
    }
}