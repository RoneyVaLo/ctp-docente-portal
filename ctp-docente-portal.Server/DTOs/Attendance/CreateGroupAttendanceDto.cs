//Este DTO representa un formulario de asistencia para un grupo completo (una sección), y permite enviar la asistencia de todos los estudiantes en una sola petición.

// Este DTO representa un formulario de asistencia para un grupo completo (una sección)
namespace ctp_docente_portal.Server.DTOs.Attendance
{
    // Formulario de asistencia para una sección/materia en una fecha
    public class CreateGroupAttendanceDto
    {
        public int StudentId { get; set; }
        public int SectionId { get; set; }
        public int SubjectId { get; set; }       
        public DateOnly Date { get; set; }        
        public DateTime TakenAt { get; set; }     
        public List<StudentAttendanceDto> Students { get; set; } = new();
        public string Observations { get; set; } = string.Empty;
    }

    public class AttendanceStudentDto
    {
        public int StudentId { get; set; }
        public int StatusTypeId { get; set; }
        public int MinutesLate { get; set; } = 0;         
        public string Observations { get; set; } = string.Empty;
    }
}
