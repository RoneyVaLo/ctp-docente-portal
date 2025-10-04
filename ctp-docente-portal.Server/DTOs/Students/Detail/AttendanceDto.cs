namespace ctp_docente_portal.Server.DTOs.Students.Detail
{
    public class AttendanceDto
    {
        public int Present { get; set; }
        public int Absent { get; set; }
        public int Justified { get; set; }
        public int Late { get; set; }
        public decimal Percentage { get; set; }
        public List<AttendanceDetailDto> Details { get; set; }
    }
}
