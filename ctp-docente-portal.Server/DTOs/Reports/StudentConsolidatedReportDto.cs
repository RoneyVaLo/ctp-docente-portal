namespace ctp_docente_portal.Server.DTOs.Reports
{
    public class StudentConsolidatedReportDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public List<string> Groups { get; set; } = new();
        public List<string> Subjects { get; set; } = new();
        public double GeneralAverage { get; set; }
        public int TotalPresent { get; set; }
        public int TotalAbsences { get; set; }
    }
}
