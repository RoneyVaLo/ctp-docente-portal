using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.DTOs.Students;
using ctp_docente_portal.Server.DTOs.Students.Detail;
using ctp_docente_portal.Server.Helpers;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class StudentService : IStudentService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IReportService _reportService;

        public StudentService(AppDbContext context, IMapper mapper, IReportService reportService)
        {
            _context = context;
            _mapper = mapper;
            _reportService = reportService;
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
            var performance = await _reportService.GetStudentPerformanceAsync(filter);

            return performance.Select(p => new StudentReportDto
            {
                Id = p.StudentId,
                Name = p.FullName,
                Identification = p.Identification,
                Group = new SimpleDto { Id = p.GroupId, Name = p.GroupName },
                Average = (int)p.Average,
                Attendance = p.AttendancePercentage,
                Status = new SimpleDto
                {
                    Name = p.Average >= 90 ? "Excelente" :
                           p.Average >= 80 ? "Bueno" :
                           p.Average >= 70 ? "Regular" : "Necesita apoyo"
                }
            }).ToList();
        }

        public async Task<StudentDetailDto?> GetStudentDetailAsync(int userId, int studentId, ReportFilterDto filter)
        {
            var student = await _context.Students
            .Where(s => s.Id == studentId)
            .Select(s => new StudentDetailDto
            {
                Id = s.Id,
                FullName = $"{s.Name} {(s.MiddleName ?? "")} {s.LastName} {(s.NdLastName ?? "")}".Trim(),
                Identification = s.IdentificationNumber ?? "",
                BirthDate = s.BirthDate.HasValue ? s.BirthDate.Value.ToString("dd/MM/yyyy") : "",
                Age = s.BirthDate.HasValue ? DateTime.Now.Year - s.BirthDate.Value.Year : 0,
                Gender = _context.Genders
                    .Where(g => g.Id == s.GenderId)
                    .Select(g => g.Name)
                    .FirstOrDefault() ?? "No Indica",

                Group = (from ss in _context.SectionStudents
                         join sec in _context.Sections on ss.SectionId equals sec.Id
                         where ss.StudentId == s.Id
                         select sec.Name).FirstOrDefault() ?? "",

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

            var staffId = await StaffHelper.GetStaffIdAsync(_context, userId);
            //if (staffId == 0) return new List<GradeDto>();

            bool isAdmin = await StaffHelper.IsAdminAsync(_context, staffId);

            var assignments = _context.SectionAssignments
                .Where(sa => sa.AcademicPeriodId == filter.AcademicPeriodId &&
                             sa.SectionId == filter.SectionId);

            if (!isAdmin)
            {
                assignments = assignments.Where(sa => sa.StaffId == staffId);
            }

            var subjectIds = await assignments
                .Select(sa => sa.SubjectId)
                .Distinct()
                .ToListAsync();

            // --- Calificaciones de ítems simples ---
            var simpleGrades = await (
                from ss in _context.SectionStudents
                join sa in _context.SectionAssignments
                    on ss.SectionId equals sa.SectionId
                join subj in _context.Subjects
                    on sa.SubjectId equals subj.Id
                join ei in _context.EvaluationItems.Where(e => !e.HasCriteria)
                    on sa.Id equals ei.SectionAssignmentId into evaluationItems
                from ei in evaluationItems.DefaultIfEmpty()
                join se in _context.StudentEvaluationScores
                    .Where(s => s.StudentId == studentId)
                    on ei.Id equals se.EvaluationItemId into scores
                from se in scores.DefaultIfEmpty()
                where ss.StudentId == studentId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                      && ss.SectionId == filter.SectionId
                      && subjectIds.Contains(sa.SubjectId)

            select new
                {
                    Subject = subj.Name.ToLower().Replace(" ", "_"),
                    Evaluation = ei != null ? ei.Name : null,
                    Score = se != null ? se.Score : 0,
                    Percentage = ei != null ? ei.Percentage : 0,
                    Date = se != null
                        ? se.CreatedAt.ToString("dd/MM/yyyy")
                        : null
                }
            ).ToListAsync();


            // --- Calificaciones de ítems con criterios (rúbricas) ---
            var criteriaGrades = await (
                from ss in _context.SectionStudents
                join sa in _context.SectionAssignments
                    on ss.SectionId equals sa.SectionId
                join subj in _context.Subjects
                    on sa.SubjectId equals subj.Id
                join ei in _context.EvaluationItems.Where(e => e.HasCriteria)
                    on sa.Id equals ei.SectionAssignmentId
                join sc in _context.StudentCriteriaScores
                    .Where(s => s.StudentId == studentId)
                    on ei.Id equals sc.EvaluationItemId into criteriaScores
                from sc in criteriaScores.DefaultIfEmpty()
                join ec in _context.EvaluationCriteria
                    on sc.CriteriaId equals ec.Id into criteria
                from ec in criteria.DefaultIfEmpty()
                where ss.StudentId == studentId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                      && ss.SectionId == filter.SectionId
                      && subjectIds.Contains(sa.SubjectId)
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
                        ? g.Sum(x =>
                            (double)(x.sc != null ? x.sc.Score : 0) *
                            (double)(x.ec != null ? x.ec.Weight : 0) / 100.0)
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
                      && subjectIds.Contains(a.SubjectId)
                join s in _context.Subjects on a.SubjectId equals s.Id
                orderby a.Date
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
                Late = attendanceRecords.Count(a => a.StatusTypeId == 4),
                Details = attendanceRecords
                    .Select(a => new AttendanceDetailDto
                    {
                        Date = a.Date.ToString("dd/MM/yyyy"),
                        Status = a.StatusTypeId == 1 ? "Presente" :
                                 a.StatusTypeId == 2 ? "Ausente" :
                                 a.StatusTypeId == 3 ? "Justificado" : "Tardía",
                        Observations = a.Observations ?? "",
                        Subject = a.SubjectName
                    })
                    .ToList()
            };

            int total = attendanceDto.Present + attendanceDto.Absent + attendanceDto.Justified + attendanceDto.Late;
            attendanceDto.Percentage = total > 0 ? Math.Round((decimal)attendanceDto.Present / total * 100, 2) : 0;

            student.Attendance = attendanceDto;

            return student;
        }
    }
}
