namespace ctp_docente_portal.Server.DTOs.Attendance
{
    public class UpdateAttendanceDto
    {
        public int Id { get; set; }
        public int StatusTypeId { get; set; }
        public string? Observations { get; set; }
    }
}
