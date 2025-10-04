namespace ctp_docente_portal.Server.DTOs.Reports.PDF
{
    public class GeneralPerformanceDto
    {
        public string Section { get; set; } = "";
        public string Subject { get; set; } = "";
        public int Average { get; set; }
        public string AverageAttendance { get; set; } = "";
        public int StudentsAtRisk { get; set; }
    }
}
