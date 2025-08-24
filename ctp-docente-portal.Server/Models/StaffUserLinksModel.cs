namespace ctp_docente_portal.Server.Models
{
    public class StaffUserLinksModel
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
    }
}
