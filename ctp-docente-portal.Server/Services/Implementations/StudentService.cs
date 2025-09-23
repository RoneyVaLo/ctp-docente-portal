using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.DTOs.Students;
using ctp_docente_portal.Server.DTOs.Students.Detail;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class StudentService : IStudentService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public StudentService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<StudentDto>> GetStudentsBySectionAsync(int sectionId, int userId)
        {
            int staffId = await _context.StaffUserLinks
                .Where(x => x.UserId == userId)
                .Select(x => x.StaffId)
                .FirstOrDefaultAsync();

            if (staffId == 0)
            {
                throw new KeyNotFoundException($"Usuario con ID {userId} no encontrado");
            }

            // Validación de asignación de sección
            bool isAssigned = await _context.SectionAssignments
                .AsNoTracking()
                .AnyAsync(sa => sa.SectionId == sectionId && sa.StaffId == staffId);

            if (!isAssigned)
            {
                throw new UnauthorizedAccessException("El profesor no tiene acceso a esta sección.");
            }

            // Proyección directa a DTO con AutoMapper
            var students = await _context.SectionStudents
                .AsNoTracking()
                .Where(ss => ss.SectionId == sectionId && ss.isActive)
                .Join(
                _context.Students.Where(s => s.IsActive),
                ss => ss.StudentId,
                s => s.Id,
                (ss, s) => s
                )
                .OrderBy(s => s.LastName)
                .ToListAsync();

            // Mapeo en memoria con AutoMapper (evita errores SQL)
            var studentDtos = _mapper.Map<List<StudentDto>>(students);
            return studentDtos;
        }

        public async Task<List<StudentReportDto>> GetStudentReportsAsync(ReportFilterDto filter)
        {
            // Traemos estudiantes con su sección
            var estudiantes = await (
                from s in _context.Students
                join ss in _context.SectionStudents on s.Id equals ss.StudentId
                join sec in _context.Sections on ss.SectionId equals sec.Id
                join e in _context.Enrollments on sec.EnrollmentId equals e.Id
                join ap in _context.AcademicPeriods on e.Id equals ap.EnrollmentId
                join es in _context.EnrollmentStudent on s.Id equals es.StudentId
                where s.IsActive
                      && sec.Id == filter.SectionId
                      && ap.Id == filter.AcademicPeriodId
                      && es.EnrollmentId == e.Id
                select new
                {
                    StudentId = s.Id,
                    Nombre = $"{s.Name} {s.MiddleName} {s.LastName} {s.NdLastName}".Trim(),
                    Identificacion = s.IdentificationNumber,
                    GrupoId = sec.Id,
                    GrupoName = sec.Name
                }
            ).ToListAsync();

            if (!estudiantes.Any()) return new List<StudentReportDto>();

            var studentIds = estudiantes.Select(e => e.StudentId).ToList();

            // Relación de ítems válidos según periodo y materia
            var validItemIds = await (
                from item in _context.EvaluationItems
                join sa in _context.SectionAssignments on item.SectionAssignmentId equals sa.Id
                where sa.SectionId == filter.SectionId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                      && (!filter.SubjectId.HasValue || sa.SubjectId == filter.SubjectId.Value)
                select item.Id
            ).ToListAsync();

            if (!validItemIds.Any())
            {
                // No hay ítems → devolvemos estudiantes sin notas ni asistencias
                return estudiantes.Select(e => new StudentReportDto
                {
                    Id = e.StudentId,
                    Name = e.Nombre,
                    Identification = e.Identificacion,
                    Group = new SimpleDto { Id = e.GrupoId, Name = e.GrupoName },
                    Average = 0,
                    Attendance = 0
                }).ToList();
            }

            // --- Promedios ---
            // Items simples (sin criterios)
            var simpleScores = await (
                from score in _context.StudentEvaluationScores
                join item in _context.EvaluationItems on score.EvaluationItemId equals item.Id
                where studentIds.Contains(score.StudentId)
                      && !item.HasCriteria
                      && validItemIds.Contains(item.Id)
                group new { score, item } by score.StudentId into g
                select new
                {
                    StudentId = g.Key,
                    Total = g.Sum(x => (double)x.score.Score * (double)x.item.Percentage / 100.0)
                }
            ).ToListAsync();

            // Items con criterios (rúbricas)
            var criteriaScores = await (
                from sc in _context.StudentCriteriaScores
                join criteria in _context.EvaluationCriteria on sc.CriteriaId equals criteria.Id
                join item in _context.EvaluationItems on sc.EvaluationItemId equals item.Id
                where studentIds.Contains(sc.StudentId)
                      && item.HasCriteria
                      && validItemIds.Contains(item.Id)
                group new { sc, criteria, item } by new { sc.StudentId, sc.EvaluationItemId, item.Percentage } into g
                select new
                {
                    g.Key.StudentId,
                    // Nota del ítem = (suma ponderada de rúbricas) * porcentaje del ítem
                    Total = g.Sum(x => (double)x.sc.Score * (double)x.criteria.Weight / 100.0) * ((double)g.Key.Percentage / 100.0)
                }
            ).ToListAsync();

            var criteriaGrouped = criteriaScores
                .GroupBy(x => x.StudentId)
                .Select(g => new { StudentId = g.Key, Total = g.Sum(x => x.Total) })
                .ToList();

            // Diccionario final de promedios
            var promedios = simpleScores
                .Concat(criteriaGrouped)
                .GroupBy(x => x.StudentId)
                .ToDictionary(g => g.Key, g => Math.Round(g.Sum(x => x.Total), 2));

            // --- Asistencias ---
            var asistencia = await (
                from a in _context.Attendances
                join sa in _context.SectionAssignments
                    on new { a.SectionId, a.SubjectId } equals new { sa.SectionId, sa.SubjectId }
                where studentIds.Contains(a.StudentId)
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                      && sa.SectionId == filter.SectionId
                      && (!filter.SubjectId.HasValue || sa.SubjectId == filter.SubjectId.Value)
                group a by a.StudentId into g
                select new
                {
                    StudentId = g.Key,
                    Total = g.Count(),
                    Presentes = g.Count(x => x.StatusTypeId == 1) // 1 = presente
                }
            ).ToListAsync();

            var asistenciaDict = asistencia.ToDictionary(
                x => x.StudentId,
                x => x.Total == 0 ? 0 : Math.Round((decimal)x.Presentes * 100 / x.Total, 2)
            );

            // --- Resultado final ---
            var result = estudiantes.Select(e => new StudentReportDto
            {
                Id = e.StudentId,
                Name = e.Nombre,
                Identification = e.Identificacion,
                Group = new SimpleDto { Id = e.GrupoId, Name = e.GrupoName },
                Average = promedios.ContainsKey(e.StudentId) ? (decimal)promedios[e.StudentId] : 0,
                Attendance = asistenciaDict.ContainsKey(e.StudentId) ? asistenciaDict[e.StudentId] : 0,
                Status = new SimpleDto
                {
                    Name = promedios.ContainsKey(e.StudentId)
                    ? (promedios[e.StudentId] >= 90 ? "Excelente" :
                    promedios[e.StudentId] >= 80 ? "Bueno" :
                    promedios[e.StudentId] >= 70 ? "Regular" : "Deficiente")
                    : "Sin datos"
                }
            }).ToList();

            return result;
        }

        public async Task<StudentDetailDto?> GetStudentDetailAsync(int studentId, ReportFilterDto filter)
        {
            var student = await _context.Students
            .Where(s => s.Id == studentId)
            .Select(s => new StudentDetailDto
            {
                Id = s.Id,
                FullName = $"{s.Name} {(s.MiddleName ?? "")} {s.LastName} {(s.NdLastName ?? "")}".Trim(),
                Identification = s.IdentificationNumber,
                BirthDate = s.BirthDate.HasValue ? s.BirthDate.Value.ToString("dd/MM/yyyy") : "",
                Age = s.BirthDate.HasValue ? DateTime.Now.Year - s.BirthDate.Value.Year : 0,
                Gender = _context.Genders
                    .Where(g => g.Id == s.GenderId)
                    .Select(g => g.Name)
                    .FirstOrDefault() ?? "Undefined",

                Group = (from ss in _context.SectionStudents
                         join sec in _context.Sections on ss.SectionId equals sec.Id
                         where ss.StudentId == s.Id
                         select sec.Name).FirstOrDefault(),

                Parents = _context.StudentRepresentatives
                    .Where(r => r.StudentId == s.Id)
                    .Select(r => new ParentDto
                    {
                        FullName = $"{r.Name} {(r.MiddleName ?? "")} {r.LastName} {(r.ndLastName ?? "")}".Trim(),
                        Relationship = r.RelationshipTypeId == 1 ? "Padre" :
                                       r.RelationshipTypeId == 2 ? "Madre" : "Encargado",
                        Phone = r.PhoneNumber ?? "",
                        Email = r.Email ?? ""
                    }).ToList()
            })
            .FirstOrDefaultAsync();

            if (student == null)
                throw new ArgumentException("El estudiante especificado no existe.");

            // --- Calificaciones de ítems simples ---
            var simpleGrades = await (
                from ei in _context.EvaluationItems
                join sa in _context.SectionAssignments on ei.SectionAssignmentId equals sa.Id
                join subj in _context.Subjects on sa.SubjectId equals subj.Id
                join se in _context.StudentEvaluationScores
                    .Where(s => s.StudentId == studentId)
                    on ei.Id equals se.EvaluationItemId into scores
                from se in scores.DefaultIfEmpty()
                where !ei.HasCriteria
                      && sa.SectionId == filter.SectionId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                select new
                {
                    Subject = subj.Name.ToLower().Replace(" ", "_"),
                    Evaluation = ei.Name,
                    Score = se != null ? se.Score : 0,   // si no hay nota => 0
                    ei.Percentage,
                    Date = se != null
                        ? se.CreatedAt.ToString("dd/MM/yyyy")
                        : null
                }
            ).ToListAsync();

            // --- Calificaciones de ítems con criterios (rúbricas) ---
            var criteriaGrades = await (
                from ei in _context.EvaluationItems
                join sa in _context.SectionAssignments on ei.SectionAssignmentId equals sa.Id
                join subj in _context.Subjects on sa.SubjectId equals subj.Id
                join sc in _context.StudentCriteriaScores
                    .Where(s => s.StudentId == studentId)
                    on ei.Id equals sc.EvaluationItemId into criteriaScores
                from sc in criteriaScores.DefaultIfEmpty()
                join ec in _context.EvaluationCriteria
                    on sc.CriteriaId equals ec.Id into criteria
                from ec in criteria.DefaultIfEmpty()
                where ei.HasCriteria
                      && sa.SectionId == filter.SectionId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                group new { sc, ec, ei, subj } by new
                {
                    SubjectName = subj.Name,
                    EvaluationId = ei.Id,
                    EvaluationName = ei.Name,
                    ei.Percentage
                }
                into g
                select new
                {
                    Subject = g.Key.SubjectName.ToLower().Replace(" ", "_"),
                    Evaluation = g.Key.EvaluationName,
                    Score = g.Any(x => x.sc != null)
                        ? g.Sum(x => (double)x.sc.Score * (double)x.ec.Weight / 100.0)
                        : 0,
                    g.Key.Percentage,
                    Date = g.Any(x => x.sc != null)
                        ? g.Min(x => x.sc.CreatedAt).ToString("dd/MM/yyyy")
                        : null
                }
            ).ToListAsync();

            // --- Merge de notas ---
            var allGrades = simpleGrades
                .Select(x => new { x.Subject, x.Evaluation, Score = (decimal)x.Score, x.Percentage, x.Date })
                .Concat(criteriaGrades.Select(x => new { x.Subject, x.Evaluation, Score = (decimal)x.Score, x.Percentage, x.Date }))
                .ToList();

            student.Grades = allGrades
                .GroupBy(x => x.Subject)
                .ToDictionary(
                g => g.Key,
                g => g.Select(x => new DTOs.Students.Detail.GradeDto
                {
                    Evaluation = x.Evaluation,
                    Score = x.Score,
                    Date = x.Date,
                    //Average = g.Sum(y => y.Score * y.Percentage) / g.Sum(y => y.Percentage)
                    Average = g.Sum(y => y.Score * (y.Percentage / 100m))
                }).ToList()
            );

            // --- Promedio general del estudiante ---
            student.GeneralAverage = student.Grades
                .Select(g => g.Value.First().Average ?? 0)
                .DefaultIfEmpty(0)
                .Average();

            // --- Asistencias ---
            var attendanceRecords = await (
                from a in _context.Attendances
                join sa in _context.SectionAssignments
                    on new { a.SectionId } equals new { sa.SectionId }
                where a.StudentId == studentId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                      && a.SectionId == filter.SectionId
                join s in _context.Subjects on a.SubjectId equals s.Id
                orderby a.Date descending
                select new
                {
                    a.Date,
                    a.StatusTypeId,
                    a.Observations,
                    SubjectName = s.Name
                }
            ).ToListAsync();

            var attendanceDto = new DTOs.Students.Detail.AttendanceDto
            {
                Present = attendanceRecords.Count(a => a.StatusTypeId == 1),
                Absent = attendanceRecords.Count(a => a.StatusTypeId == 2),
                Justified = attendanceRecords.Count(a => a.StatusTypeId == 3),
                Details = attendanceRecords
                    .Take(5)
                    .Select(a => new AttendanceDetailDto
                    {
                        Date = a.Date.ToString("dd/MM/yyyy"),
                        Status = a.StatusTypeId == 1 ? "Presente" :
                                 a.StatusTypeId == 2 ? "Ausente" : "Justificado",
                        Observations = a.Observations ?? "",
                        Subject = a.SubjectName
                    }).ToList()
            };

            int total = attendanceDto.Present + attendanceDto.Absent + attendanceDto.Justified;
            attendanceDto.Percentage = total > 0 ? Math.Round((decimal)attendanceDto.Present / total * 100, 2) : 0;

            student.Attendance = attendanceDto;

            return student;
        }
    }
}
