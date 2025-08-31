using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.Services.Interfaces;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class ReportService : IReportService
    {
        public async Task<List<SectionAttendanceStatsDto>> GetAttendanceStatsBySectionAsync()
        {
            // Simulación de datos
            var stats = new List<SectionAttendanceStatsDto>
            {
                new() { SectionId = 1, SectionName = "Sección A", TotalSessions = 100, TotalPresent = 85, TotalAbsences = 15 },
                new() { SectionId = 2, SectionName = "Sección B", TotalSessions = 90, TotalPresent = 60, TotalAbsences = 30 },
                new() { SectionId = 3, SectionName = "Sección C", TotalSessions = 120, TotalPresent = 110, TotalAbsences = 10 }
            };

            return await Task.FromResult(stats);
        }

        public async Task<List<GradeReportDto>> GetGradesByGroupOrSubjectAsync(int? groupId = null, string? subject = null)
        {
            // Simulación de datos
            var allGrades = new List<GradeReportDto>
            {
                new() { StudentId = 1, StudentName = "Ana Morales", GroupId = 1, GroupName = "Grupo A", Subject = "Matemática", Average = 87.5 },
                new() { StudentId = 2, StudentName = "Luis Jiménez", GroupId = 1, GroupName = "Grupo A", Subject = "Matemática", Average = 74.0 },
                new() { StudentId = 3, StudentName = "Carlos Pérez", GroupId = 2, GroupName = "Grupo B", Subject = "Ciencias", Average = 91.2 }
            };

            var result = allGrades.AsQueryable();

            if (groupId.HasValue)
                result = result.Where(g => g.GroupId == groupId.Value);

            if (!string.IsNullOrEmpty(subject))
                result = result.Where(g => g.Subject.Equals(subject, StringComparison.OrdinalIgnoreCase));

            return await Task.FromResult(result.ToList());
        }
        public async Task<StudentConsolidatedReportDto> GetStudentConsolidatedReportAsync(int studentId)
        {
            // Simulamos datos para un estudiante específico
            var student = new StudentConsolidatedReportDto
            {
                StudentId = studentId,
                StudentName = "Ana Morales",
                Groups = new List<string> { "Grupo A" },
                Subjects = new List<string> { "Matemática", "Ciencias", "Estudios Sociales" },
                GeneralAverage = 85.3,
                TotalPresent = 120,
                TotalAbsences = 10
            };

            return await Task.FromResult(student);
         }


    }
}
