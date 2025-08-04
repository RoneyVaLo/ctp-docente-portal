//Este DTO representa un formulario de asistencia para un grupo completo (una sección), y permite enviar la asistencia de todos los estudiantes en una sola petición.

// Este DTO representa un formulario de asistencia para un grupo completo (una sección)
namespace ctp_docente_portal.Server.DTOs.Attendance
{
    public class CreateAttendanceDto
    {
        public int StudentId { get; set; }
        public int SectionId { get; set; }
        public DateTime Date { get; set; }
        public List<StudentAttendanceDto> Students { get; set; } = new();
        public string Observations { get; set; } = string.Empty;
    }

    public class AttendanceStudentDto
    {
        public int StudentId { get; set; }
        public int StatusTypeId { get; set; }

        // Evita valores NULL
        public string Observations { get; set; } = string.Empty;
    }

    public class CreateGroupAttendanceDto
    {
        public int SectionId { get; set; }
        public DateTime Date { get; set; }
        public List<AttendanceStudentDto> Students { get; set; } = new();
    }
}
