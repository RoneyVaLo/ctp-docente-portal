namespace ctp_docente_portal.Server.DTOs.Attendance
{
    public class AttendanceQueryDto
    {
        public int StudentId { get; set; }
        public string? StudentName { get; set; } 
        public int TotalAbsent { get; set; }
        public int TotalLate { get; set; }
        public int TotalJustified { get; set; }
    }
}
