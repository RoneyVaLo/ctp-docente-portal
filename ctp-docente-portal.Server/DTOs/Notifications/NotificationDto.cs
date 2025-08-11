namespace ctp_docente_portal.Server.DTOs.Notifications
{
    public sealed class NotificationDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Message { get; set; } = "";
        // SENT | FAILED | QUEUED
        public string Status { get; set; } = "SENT";
        public string? ProviderMessageId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
        public string? Error { get; set; }
    }
}
