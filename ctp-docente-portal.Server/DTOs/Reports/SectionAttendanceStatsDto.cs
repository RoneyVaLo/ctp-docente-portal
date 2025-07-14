namespace ctp_docente_portal.Server.DTOs.Reports
{
    public class SectionAttendanceStatsDto
    {
        public int SectionId { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public int TotalSessions { get; set; }
        public int TotalPresent { get; set; }
        public int TotalAbsences { get; set; }
        public double AttendancePercentage => TotalSessions == 0 ? 0 : (double)TotalPresent / TotalSessions * 100;
    }
}
