namespace ctp_docente_portal.Server.DTOs.Reports
{
    public class PerformanceResultDto
    {
        public string Section { get; set; } = "";
        public string Subject { get; set; } = "";
        public double Average { get; set; }
        public double AttendancePercentage { get; set; }
        public int StudentsAtRisk { get; set; }
    }
}
