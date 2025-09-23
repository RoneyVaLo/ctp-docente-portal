namespace ctp_docente_portal.Server.DTOs.Reports
{
    public class GeneralStatsDto
    {
        public double GeneralAverage { get; set; }
        public double AverageAttendance { get; set; }
        public int TopStudentsCount { get; set; }
        public int AtRiskStudentsCount { get; set; }
    }
}
