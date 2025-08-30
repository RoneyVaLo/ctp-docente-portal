namespace ctp_docente_portal.Server.Models
{
    public class WhatsAppMessage
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool Sent { get; set; } = false;
    }
}
