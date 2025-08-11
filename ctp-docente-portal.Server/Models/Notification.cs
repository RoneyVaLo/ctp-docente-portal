namespace ctp_docente_portal.Server.Models;

public class Notification
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = "";
    public string Phone { get; set; } = "";
    public DateTime Date { get; set; }              // fecha de la ausencia
    public int SectionId { get; set; }

    public string Message { get; set; } = "";
    public string Status { get; set; } = "QUEUED";  // SENT | FAILED | QUEUED
    public string? ProviderMessageId { get; set; }
    public string? Error { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SentAt { get; set; }
}
