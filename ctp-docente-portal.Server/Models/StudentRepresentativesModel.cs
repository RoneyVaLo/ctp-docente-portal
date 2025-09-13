using System.ComponentModel.DataAnnotations.Schema;

namespace ctp_docente_portal.Server.Models
{
    [Table("StudentRepresentatives")]
    public class StudentRepresentativesModel
    {
        public int Id { get; set; }
        public string IdentificationNumber { get; set; }
        public string Name { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string ndLastName { get; set; }
        public int GenderId { get; set; }
        public string Email { get; set; }
        public string? PhoneNumber { get; set; }
        public int StudentId { get; set; }
        public int RelationshipTypeId { get; set; }
        public bool isActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
