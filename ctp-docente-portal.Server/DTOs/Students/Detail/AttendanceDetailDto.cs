namespace ctp_docente_portal.Server.DTOs.Students.Detail
{
    public class AttendanceDetailDto
    {
        public string Date { get; set; }
        public string Status { get; set; }
        public string Observations { get; set; }
        public string? Subject { get; set; }
    }
}
