using ctp_docente_portal.Server.DTOs.Common;

namespace ctp_docente_portal.Server.DTOs.Students
{
    public class StudentReportDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Identification { get; set; }
        public SimpleDto Group { get; set; }
        public int Average { get; set; }
        public decimal Attendance { get; set; }
        public SimpleDto Status { get; set; }
    }
}
