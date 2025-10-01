using System;

namespace ctp_docente_portal.Server.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = "";
        public int SectionId { get; set; }
        public int? SubjectId { get; set; }
        public string? Phone { get; set; } = "";
        public string Message { get; set; } = "";
        public string Status { get; set; } = "SENT";
        public string? ProviderMessageId { get; set; }
        public DateOnly Date { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
        public string? Error { get; set; }
    }
}