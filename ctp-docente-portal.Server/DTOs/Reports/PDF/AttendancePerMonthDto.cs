namespace ctp_docente_portal.Server.DTOs.Reports.PDF
{
    public class AttendancePerMonthDto
    {
        public string Section { get; set; } = "";
        public string Subject { get; set; } = "";
        public List<string> Months { get; set; } = new();
        public string Average { get; set; } = "";
    }
}
