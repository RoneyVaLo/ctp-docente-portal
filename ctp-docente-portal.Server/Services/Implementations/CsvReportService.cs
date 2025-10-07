using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.DTOs.Reports.CSV;
using ctp_docente_portal.Server.Helpers;
using ctp_docente_portal.Server.Services.Interfaces;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class CsvReportService : ICsvReportService
    {
        private readonly AppDbContext _context;

        public CsvReportService(AppDbContext context)
        {
            _context = context;
        }
        public byte[] GenerateStudentCsv(ReportFilterDto filter)
        {
            // 1. Obtener la asignación de sección/curso/periodo
            var sectionAssignment = _context.SectionAssignments
                .FirstOrDefault(sa => sa.SectionId == filter.SectionId &&
                                      sa.SubjectId == filter.SubjectId &&
                                      sa.AcademicPeriodId == filter.AcademicPeriodId);

            if (sectionAssignment == null)
                throw new KeyNotFoundException("No existe una asignación de sección para los filtros especificados.");

            // 2. Obtener los estudiantes inscritos en la sección
            var students = (from ss in _context.SectionStudents
                            join s in _context.Students on ss.StudentId equals s.Id
                            where ss.SectionId == filter.SectionId
                            orderby s.LastName
                            select new
                            {
                                s.Id,
                                s.IdentificationNumber,
                                FullName = $"{s.Name} {s.MiddleName} {s.LastName} {s.NdLastName}".Trim()
                            }).ToList();

            // 3. Obtener los ítems de evaluación para esta asignación
            var evaluationItems = _context.EvaluationItems
                .Where(ei => ei.SectionAssignmentId == sectionAssignment.Id)
                .ToList();

            // 4. Obtener calificaciones por estudiante + ítem
            var evaluationScores = _context.StudentEvaluationScores
                .Where(se => evaluationItems.Select(ei => ei.Id).Contains(se.EvaluationItemId))
                .ToList();

            // 🔹 4.1. Calcular asistencia automáticamente
            var attendanceItem = evaluationItems.FirstOrDefault(i => i.Name.ToLower().Contains("asistencia"));
            Dictionary<int, decimal> attendanceScores = new();

            if (attendanceItem != null)
            {
                var studentIds = students.Select(s => s.Id).ToList();

                var attendances = _context.Attendances
                    .Where(a => a.SubjectId == filter.SubjectId && a.SectionId == filter.SectionId && studentIds.Contains(a.StudentId))
                    .ToList();

                var totalSessions = attendances
                    .Select(a => a.Date)
                    .Distinct()
                    .Count();

                if (totalSessions > 0)
                {
                    attendanceScores = attendances
                        .GroupBy(a => a.StudentId)
                        .ToDictionary(
                            g => g.Key,
                            g =>
                            {
                                decimal totalPoints = g.Sum(a =>
                                    a.StatusTypeId == 1 ? 1m :
                                    a.StatusTypeId == 3 ? 0.5m : 0m);

                                return (totalPoints * 100m) / totalSessions;
                            });
                }
            }


            // 5. Mapear a DTO para el CSV
            var studentDtos = new List<StudentCsvDto>();

            foreach (var student in students)
            {
                var dto = new StudentCsvDto
                {
                    Id = student.IdentificationNumber ?? student.Id.ToString(),
                    Name = student.FullName,
                };

                foreach (var item in evaluationItems)
                {
                    decimal scoreValue = 0;

                    if (item == attendanceItem)
                    {
                        // ✅ Usar cálculo automático si es asistencia
                        if (attendanceScores.TryGetValue(student.Id, out var attendanceScore))
                            scoreValue = attendanceScore;
                    }
                    else
                    {
                        var score = evaluationScores
                            .FirstOrDefault(s => s.StudentId == student.Id && s.EvaluationItemId == item.Id);

                        scoreValue = score?.Score ?? 0;
                    }

                    dto.Items[item.Name] = (int)Math.Round(scoreValue);
                }

                studentDtos.Add(dto);
            }

            // 6. Exportar CSV usando el helper
            return CsvExportHelper.ExportToCsv(studentDtos);
        }
    }
}
