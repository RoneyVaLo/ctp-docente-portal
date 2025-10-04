namespace ctp_docente_portal.Server.DTOs.Reports.PDF
{
    public class StudentPerformanceDto
    {
        public string Semester { get; set; }
        public string Name { get; set; }
        public string Identification { get; set; }
        public string Section { get; set; }
        public List<SubjectReportDto> Subjects { get; set; } = new();
        public int JustifiedAbsences { get; set; }
        public int UnjustifiedAbsences { get; set; }
        public int LateArrivals { get; set; }
    }
}
