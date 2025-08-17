using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ctp_docente_portal.Server.Models
{
    //[NotMapped]
    public class SectionsModel
    {
        //[Key]
        //[Column("Id")]
        public int Id { get; set; }

        public int GradeId { get; set; }
        public int EnrollmentId { get; set; }

        // En tu tabla estos campos existen; si alguno puede ser NULL, hazlo nullable.
        public int? SpecialityIdSubA { get; set; }
        public int? SpecialityIdSubB { get; set; }

        public string? Name { get; set; }
        public int Size { get; set; }
        public string? Description { get; set; }

        [Column("isActive")]          // <-- columna real en BD
        public bool IsActive { get; set; }  // <-- propiedad en C#

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
