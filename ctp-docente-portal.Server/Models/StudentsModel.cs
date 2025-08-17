using System.ComponentModel.DataAnnotations.Schema;

namespace ctp_docente_portal.Server.Models
{
    [Table("Students")]
    public class StudentsModel
    {
        public int Id { get; set; }

        public string? Name { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }

        [Column("ndLastName")]   // <-- columna real
        public string? NdLastName { get; set; }  // <-- usar esta propiedad en el LINQ

        [Column("isActive")]
        public bool IsActive { get; set; }
    }
}