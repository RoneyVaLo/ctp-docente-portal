using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.Services.Interfaces;
using ctp_docente_portal.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _db;

        public ReportService(AppDbContext db)
        {
            _db = db;
        }
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
         

          public async Task<List<GradeDetailRowDto>> GetGradesBySectionAndDateAsync(int? sectionId, DateOnly? date)
        {
            DateTime? startUtc = null, endUtc = null;
            if (date.HasValue)
            {
                var offset = TimeSpan.FromHours(-6);
                var startLocal = date.Value.ToDateTime(TimeOnly.MinValue);
                var start = new DateTimeOffset(startLocal, offset);
                startUtc = start.UtcDateTime;
                endUtc = start.AddDays(1).UtcDateTime;
            }

            var qProper =
                from ses in _db.StudentEvaluationScores.AsNoTracking()
                join ei in _db.EvaluationItems.AsNoTracking() on ses.EvaluationItemId equals ei.Id
                join sa in _db.SectionAssignments.AsNoTracking() on ei.SectionAssignmentId equals sa.Id
                join sec in _db.Section.AsNoTracking() on sa.SectionId equals sec.Id
                join en in _db.Enrollments.AsNoTracking() on sec.EnrollmentId equals en.Id
                join es in _db.EnrollmentStudent.AsNoTracking()
                     on new { E = en.Id, S = ses.StudentId } equals new { E = es.EnrollmentId, S = es.StudentId }
                join st in _db.Students.AsNoTracking() on ses.StudentId equals st.Id
                where (sectionId == null || sec.Id == sectionId.Value)
                   && !ei.IsDraft
                   && (es.IsActive ?? true)
                   && st.IsActive
                   && (!startUtc.HasValue || (ses.CreatedAt >= startUtc.Value && ses.CreatedAt < endUtc!.Value))
                select new GradeDetailRowDto
                {
                    StudentId = st.Id,
                    StudentName = (
                        (st.Name ?? "")
                        + ((st.MiddleName ?? "") != "" ? " " + st.MiddleName : "")
                        + ((st.LastName ?? "") != "" ? " " + st.LastName : "")
                        + ((st.NdLastName ?? "") != "" ? " " + st.NdLastName : "")
                    ).Trim(),
                    SectionId = sec.Id,
                    SectionName = sec.Name,
                    EvaluationItemId = ei.Id,
                    EvaluationItemName = ei.Name ?? "",
                    Score = (double?)ses.Score ?? 0d,
                    Percentage = (double?)ei.Percentage ?? 0d,
                    CreatedAtUtc = ses.CreatedAt
                };

            
           var qFallback =
                from ses in _db.StudentEvaluationScores.AsNoTracking()
                join ei in _db.EvaluationItems.AsNoTracking() on ses.EvaluationItemId equals ei.Id
                join sec in _db.Section.AsNoTracking() on ei.SectionAssignmentId equals sec.Id
                join en in _db.Enrollments.AsNoTracking() on sec.EnrollmentId equals en.Id
                join es in _db.EnrollmentStudent.AsNoTracking()
                     on new { E = en.Id, S = ses.StudentId } equals new { E = es.EnrollmentId, S = es.StudentId }
                join st in _db.Students.AsNoTracking() on ses.StudentId equals st.Id
                where !_db.SectionAssignments.Any(sa => sa.Id == ei.SectionAssignmentId)
                   && (sectionId == null || sec.Id == sectionId.Value)
                   && !ei.IsDraft
                   && (es.IsActive ?? true)
                   && st.IsActive
                   && (!startUtc.HasValue || (ses.CreatedAt >= startUtc.Value && ses.CreatedAt < endUtc!.Value))
                select new GradeDetailRowDto
                {
                    StudentId = st.Id,
                    StudentName = (
                        (st.Name ?? "")
                        + ((st.MiddleName ?? "") != "" ? " " + st.MiddleName : "")
                        + ((st.LastName ?? "") != "" ? " " + st.LastName : "")
                        + ((st.NdLastName ?? "") != "" ? " " + st.NdLastName : "")
                    ).Trim(),
                    SectionId = sec.Id,
                    SectionName = sec.Name,
                    EvaluationItemId = ei.Id,
                    EvaluationItemName = ei.Name ?? "",
                    Score = (double?)ses.Score ?? 0d,
                    Percentage = (double?)ei.Percentage ?? 0d,
                    CreatedAtUtc = ses.CreatedAt
                };

            var rows = await qProper
                .Concat(qFallback)
                .OrderBy(r => r.SectionName)
                .ThenBy(r => r.StudentName)
                .ThenBy(r => r.EvaluationItemId)
                .ToListAsync();

            return rows;
        }


    }
}
