using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace ctp_docente_portal.Server.Models
{
    [Table("Attendances")]
    [Index(nameof(StudentId), nameof(SectionId), nameof(SubjectId), nameof(Date),
           IsUnique = true, Name = "UX_Attendances_Student_Section_Subject_Date")]
    public class Attendance
    {
        public int Id { get; set; }

        public int StudentId { get; set; }
        public int SectionId { get; set; }
        public int SubjectId { get; set; }

        [Column(TypeName = "date")]
        public DateOnly Date { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime TakenAt { get; set; }

        public int StatusTypeId { get; set; }

        public int MinutesLate { get; set; } = 0;

        public string? Observations { get; set; }

        [Column(TypeName = "timestamp without time zone")]
        public DateTime CreatedAt { get; set; }

        [Column(TypeName = "timestamp without time zone")]
        public DateTime? UpdatedAt { get; set; }

        public int CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
