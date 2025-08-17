// Ruta: ctp-docente-portal.Server/Models/SectionStudentsModel.cs
using System.ComponentModel.DataAnnotations.Schema;

namespace ctp_docente_portal.Server.Models
{
    //[NotMapped]
    public class SectionStudentsModel
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int SectionId { get; set; }
        public int? Subsection { get; set; }

        [Column("isActive")]
        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
