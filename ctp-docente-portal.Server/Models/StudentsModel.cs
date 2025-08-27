using System.ComponentModel.DataAnnotations.Schema;

namespace ctp_docente_portal.Server.Models
{
    [NotMapped]
    public class StudentsModel
    {
        public int Id { get; set; }
        public bool isActive { get; set; }
        public int StatusId { get; set; }
        public string MiddleName { get; set; }
        public bool hasExitPermit { get; set; }
        public int GenderId { get; set; }
        public string Notes { get; set; }
        public int IdentificationTypeId { get; set; }
        public string IdentificationNumber { get; set; }
        public int AdequacyTypeId { get; set; }
        public DateTime BirthDate { get; set; }
        public string ndLastName { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public int NationalityId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
