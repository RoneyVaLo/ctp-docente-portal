namespace ctp_docente_portal.Server.DTOs.Attendance
{
    public class StudentListItemDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = "";
        public string IdentificationNumber { get; set; } = "";
        public int? Subsection { get; set; }    
        public DateTime? BirthDate { get; set; }
        public int? GenderId { get; set; }
        public string? GuardianPhone { get; set; }
    }
}
