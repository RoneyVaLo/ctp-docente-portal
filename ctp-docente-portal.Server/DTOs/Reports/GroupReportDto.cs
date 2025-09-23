namespace ctp_docente_portal.Server.DTOs.Reports
{
    public class GroupReportDto
    {
        public string Group { get; set; }
        public string Subject { get; set; }
        public double Average { get; set; }
        public double Attendance { get; set; }
        public int AtRisk { get; set; }
    }
}
