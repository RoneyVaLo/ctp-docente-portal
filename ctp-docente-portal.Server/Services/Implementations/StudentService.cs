using AutoMapper;
using AutoMapper.QueryableExtensions;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Common;
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

        public async Task<List<StudentReportDto>> GetStudentReportsAsync(int sectionId)
        {
            // Traemos estudiantes con su sección
            var estudiantes = await (
                from s in _context.Students
                join ss in _context.SectionStudents on s.Id equals ss.StudentId
                join sec in _context.Sections on ss.SectionId equals sec.Id
                where s.IsActive && sec.Id == sectionId
                select new
                {
                    StudentId = s.Id,
                    Nombre = $"{s.Name} {s.LastName} {s.NdLastName}".Trim(),
                    Identificacion = s.IdentificationNumber,
                    GrupoId = sec.Id,
                    GrupoName = sec.Name
                }
            ).ToListAsync();

            if (!estudiantes.Any()) return new List<StudentReportDto>();

            var studentIds = estudiantes.Select(e => e.StudentId).ToList();

            // --- Promedios ---
            // Items simples (sin criterios)
            var simpleScores = await (
                from score in _context.StudentEvaluationScores
                join item in _context.EvaluationItems on score.EvaluationItemId equals item.Id
                where studentIds.Contains(score.StudentId) && !item.HasCriteria
                group new { score, item } by score.StudentId into g
                select new
                {
                    StudentId = g.Key,
                    Total = g.Sum(x => x.score.Score * x.item.Percentage / 100)
                }
            ).ToListAsync();

            // Items con criterios
            var criteriaScores = await (
                from sc in _context.StudentCriteriaScores
                join criteria in _context.EvaluationCriteria on sc.CriteriaId equals criteria.Id
                join item in _context.EvaluationItems on sc.EvaluationItemId equals item.Id
                where studentIds.Contains(sc.StudentId) && item.HasCriteria
                group new { sc, criteria, item } by new { sc.StudentId, sc.EvaluationItemId } into g
                select new
                {
                    g.Key.StudentId,
                    EvalItemId = g.Key.EvaluationItemId,
                    Score = g.Sum(x => x.sc.Score * x.criteria.Weight / 100) *
                            g.First().item.Percentage / 100
                }
            ).ToListAsync();

            var criteriaGrouped = criteriaScores
                .GroupBy(x => x.StudentId)
                .Select(g => new { StudentId = g.Key, Total = g.Sum(x => x.Score) })
                .ToList();

            // Diccionario final de promedios
            var promedios = simpleScores
                .Concat(criteriaGrouped)
                .GroupBy(x => x.StudentId)
                .ToDictionary(g => g.Key, g => Math.Round(g.Sum(x => x.Total), 2));

            // --- Asistencias ---
            var asistencia = await (
                from a in _context.Attendances
                where studentIds.Contains(a.StudentId)
                group a by a.StudentId into g
                select new
                {
                    StudentId = g.Key,
                    Total = g.Count(),
                    Presentes = g.Count(x => x.StatusTypeId == 1)
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
                Average = promedios.ContainsKey(e.StudentId) ? promedios[e.StudentId] : 0,
                Attendance = asistenciaDict.ContainsKey(e.StudentId) ? asistenciaDict[e.StudentId] : 0
            }).ToList();

            return result;
        }

        public async Task<StudentDetailDto?> GetStudentDetailAsync(int studentId)
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
                        Relationship = r.RelationshipTypeId == 1 ? "Father" :
                                       r.RelationshipTypeId == 2 ? "Mother" : "Guardian",
                        Phone = r.PhoneNumber ?? "",
                        Email = r.Email
                    }).ToList()
            })
            .FirstOrDefaultAsync();

            if (student == null)
                return null;

            var gradesList = await _context.StudentEvaluationScores
            .Where(se => se.StudentId == studentId)
            .Join(_context.EvaluationItems, se => se.EvaluationItemId, ei => ei.Id, (se, ei) => new { se, ei })
            .Join(_context.SectionAssignments, x => x.ei.SectionAssignmentId, sa => sa.Id, (x, sa) => new { x.se, x.ei, sa })
            .Join(_context.Subjects, y => y.sa.SubjectId, subj => subj.Id, (y, subj) => new
            {
                Subject = subj.Name.ToLower().Replace(" ", "_"),
                Evaluation = y.ei.Name,
                Score = y.se.Score,
                Date = y.se.CreatedAt.ToString("dd/MM/yyyy")
            })
            .ToListAsync();

            student.Grades = gradesList
                .GroupBy(x => x.Subject)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => new GradeDto
                    {
                        Evaluation = x.Evaluation,
                        Score = x.Score,
                        Date = x.Date
                    }).ToList()
                );

            var attendanceRecords = await _context.Attendances
            .Where(a => a.StudentId == studentId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();

            var attendanceDto = new AttendanceDto
            {
                Present = attendanceRecords.Count(a => a.StatusTypeId == 1),
                Absent = attendanceRecords.Count(a => a.StatusTypeId == 2),
                Justified = attendanceRecords.Count(a => a.StatusTypeId == 3),
                Details = attendanceRecords
                    .Take(5)
                    .Select(a => new AttendanceDetailDto
                    {
                        Date = a.Date.ToString("dd/MM/yyyy"),
                        Status = a.StatusTypeId == 1 ? "Present" :
                                 a.StatusTypeId == 2 ? "Absent" : "Justified",
                        Observations = a.Observations ?? ""
                    }).ToList()
            };

            int total = attendanceDto.Present + attendanceDto.Absent + attendanceDto.Justified;
            attendanceDto.Percentage = total > 0 ? Math.Round((decimal)attendanceDto.Present / total * 100, 2) : 0;

            student.Attendance = attendanceDto;

            return student;
        }
    }
}
