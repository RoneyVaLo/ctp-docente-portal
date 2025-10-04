namespace ctp_docente_portal.Server.DTOs.Reports.PDF
{
    public class StudentsBySubjectDto
    {
        public string Id { get; set; } = "";
        public string FullName { get; set; } = "";
        public int Average { get; set; }
        public string Attendance { get; set; } = "";
        public string Status { get; set; } = "";
    }
}
