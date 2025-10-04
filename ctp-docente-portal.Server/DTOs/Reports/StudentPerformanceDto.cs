namespace ctp_docente_portal.Server.DTOs.Reports
{
    public class StudentPerformanceDto
    {
        public int StudentId { get; set; }
        public string Identification { get; set; } = "";
        public string FullName { get; set; } = "";
        public int GroupId { get; set; }
        public string GroupName { get; set; } = "";
        public decimal Average { get; set; }
        public decimal AttendancePercentage { get; set; }
    }
}
