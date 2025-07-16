namespace ctp_docente_portal.Server.DTOs.Reports
{
    public class GradeReportDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public double Average { get; set; }
    }
}
