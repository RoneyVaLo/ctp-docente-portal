namespace ctp_docente_portal.Server.Models
{
    public class Attendance
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int SectionId { get; set; }
        public DateTime Date { get; set; }
        public int StatusTypeId { get; set; }
        public string? Observations { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }

    namespace ctp_docente_portal.Server.Models
{
    public class WhatsAppMessage
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string PhoneNumber { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool Sent { get; set; } = false;
    }
}
}
