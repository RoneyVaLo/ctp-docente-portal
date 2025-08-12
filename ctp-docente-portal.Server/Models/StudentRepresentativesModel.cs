using System.ComponentModel.DataAnnotations.Schema;

namespace ctp_docente_portal.Server.Models
{
    [Table("StudentRepresentatives")]
    public class StudentRepresentativesModel
    {
        public int Id { get; set; }
        public int StudentId { get; set; }

        public string? PhoneNumber { get; set; }
        public int RelationshipTypeId { get; set; }
        public bool isActive { get; set; }
    }
}
