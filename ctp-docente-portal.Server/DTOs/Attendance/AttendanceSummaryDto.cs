namespace ctp_docente_portal.Server.DTOs.Attendance
{
    public class AttendanceSummaryDto
    {
        public int StudentId { get; set; }
        public int TotalPresent { get; set; }
        public int TotalAbsent { get; set; }
        public int TotalJustified { get; set; }
        public int TotalLate { get; set; }
    }
}
