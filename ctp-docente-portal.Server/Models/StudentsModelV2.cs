using System.ComponentModel.DataAnnotations.Schema;

namespace ctp_docente_portal.Server.Models
{
    [Table("Students")]
    public class StudentsModelV2
    {
        public int Id { get; set; }

        [Column("isActive")]
        public bool IsActive { get; set; } 

        public int? StatusId { get; set; }

        public string? MiddleName { get; set; }

        [Column("hasExitPermit")]
        public bool HasExitPermit { get; set; }

        public int? GenderId { get; set; }
        public string? Notes { get; set; }
        public int? IdentificationTypeId { get; set; }
        public string? IdentificationNumber { get; set; }
        public int? AdequacyTypeId { get; set; }
        public DateTime? BirthDate { get; set; }

        [Column("ndLastName")]
        public string? NdLastName { get; set; }

        public string? Name { get; set; }
        public string? LastName { get; set; }
        public int? NationalityId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
