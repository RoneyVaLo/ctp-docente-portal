namespace ctp_docente_portal.Server.DTOs.Attendance
{
    public class AttendanceQueryDto
    {
        public int? StudentId { get; set; }
        public int? SectionId { get; set; }
        public int? SubjectId { get; set; }  
        public int? StatusTypeId { get; set; }
        public DateOnly? FromDate { get; set; }
        public DateOnly? ToDate { get; set; }
    }
}
