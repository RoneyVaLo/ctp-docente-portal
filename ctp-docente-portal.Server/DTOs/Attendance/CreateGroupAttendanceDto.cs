// ctp_docente_portal.Server/DTOs/Attendance/CreateGroupAttendanceDto.cs
namespace ctp_docente_portal.Server.DTOs.Attendance
{
    // Formulario de asistencia para una sección/materia en una fecha
    public class CreateGroupAttendanceDto
    {
        public int SectionId { get; set; }
        public int SubjectId { get; set; }
        public DateOnly Date { get; set; }
        public DateTime TakenAt { get; set; }
        public List<StudentAttendanceDto> Students { get; set; } = new();
        public string Observations { get; set; } = string.Empty;
    }

    public class StudentAttendanceDto
    {
        public int StudentId { get; set; }


        public string? StudentName { get; set; } = null;
        public string? Phone { get; set; } = null;

        public int StatusTypeId { get; set; }
        public int? MinutesLate { get; set; } = 0;
        public string Observations { get; set; } = string.Empty;
    }
}