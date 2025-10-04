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
                    var score = evaluationScores
                        .FirstOrDefault(s => s.StudentId == student.Id && s.EvaluationItemId == item.Id);

                    dto.Items[item.Name] = score?.Score != null ? (int)score.Score : 0;
                }

                studentDtos.Add(dto);
            }

            // 6. Exportar CSV usando el helper
            return CsvExportHelper.ExportToCsv(studentDtos);
        }
    }
}
