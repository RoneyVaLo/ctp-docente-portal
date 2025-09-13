namespace ctp_docente_portal.Server.DTOs.Students.Detail
{
    public class StudentDetailDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Identification { get; set; }
        public string Group { get; set; }
        public string BirthDate { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; }
        public List<ParentDto> Parents { get; set; }
        public Dictionary<string, List<GradeDto>> Grades { get; set; }
        public AttendanceDto Attendance { get; set; }
    }
}
