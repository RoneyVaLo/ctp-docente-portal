namespace ctp_docente_portal.Server.Models
{
    public class WhatsAppMessage
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string PhoneNumber { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool Sent { get; set; }
    }
}

