namespace ctp_docente_portal.Server.Models
{
    public class LoginAttempts
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Attempts { get; set; }
        public DateTime? LockedUntil { get; set; }
        public DateTime LastAttempt { get; set; }
    }
}
