using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.Helpers;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<GradeDto>> GetGradesAsync(int userId, ReportFilterDto filter)
        {
            var staffId = await StaffHelper.GetStaffIdAsync(_context, userId);
            if (staffId == 0) return new List<GradeDto>();

            bool isAdmin = await StaffHelper.IsAdminAsync(_context, staffId);

            var assignments = from sa in _context.SectionAssignments
                              join sub in _context.Subjects on sa.SubjectId equals sub.Id
                              where sa.AcademicPeriodId == filter.AcademicPeriodId
                                    && sa.SectionId == filter.SectionId
                                    && (isAdmin || sa.StaffId == staffId)
                                    && (!filter.SubjectId.HasValue || sa.SubjectId == filter.SubjectId.Value)
                              select new
                              {
                                  sa.Id,
                                  sa.SubjectId,
                                  sa.StaffId,
                                  SubjectName = sub.Name
                              };
            if (!isAdmin)
            {
                assignments = assignments.Where(sa => sa.StaffId == staffId);
            }

            var assignmentsList = await assignments.ToListAsync();

            if (!assignmentsList.Any()) return new List<GradeDto>();

            var subjectIds = assignmentsList.Select(sa => sa.SubjectId).Distinct().ToList();

            var validItems = await (
                from item in _context.EvaluationItems
                join sa in _context.SectionAssignments on item.SectionAssignmentId equals sa.Id
                where sa.SectionId == filter.SectionId
                && sa.AcademicPeriodId == filter.AcademicPeriodId
                && subjectIds.Contains(sa.SubjectId)
                select new EvaluationItemDto
                {
                    Id = item.Id,
                    HasCriteria = item.HasCriteria,
                    Percentage = item.Percentage,
                    SubjectId = sa.SubjectId,
                    AssignmentId = sa.Id
                }
            ).ToListAsync();

            var itemIds = validItems.Select(i => i.Id).ToList();

            var criteria = await _context.EvaluationCriteria
                .Where(c => itemIds.Contains(c.EvaluationItemId))
                .ToListAsync();

            var studentCriteriaScores = await _context.StudentCriteriaScores
                .Where(s => itemIds.Contains(s.EvaluationItemId))
                .ToListAsync();

            var studentScores = await _context.StudentEvaluationScores
                .Where(s => itemIds.Contains(s.EvaluationItemId))
                .ToListAsync();

            var evaluationItemsByAssignment = validItems
                .GroupBy(i => i.AssignmentId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var evaluationCriteria = criteria
                .GroupBy(c => c.EvaluationItemId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var studentCriteriaScoresDict = studentCriteriaScores
                .GroupBy(s => (s.StudentId, s.EvaluationItemId))
                .ToDictionary(g => g.Key, g => g.ToList());

            var studentEvaluationScoresDict = studentScores
                .GroupBy(s => (s.StudentId, s.EvaluationItemId))
                .ToDictionary(g => g.Key, g => g.ToList());

            var studentIds = await _context.SectionStudents
                .Where(ss => ss.SectionId == filter.SectionId)
                .Select(ss => ss.StudentId)
                .ToListAsync();

            var subjectScores = assignmentsList.ToDictionary(a => a.SubjectId, a => new List<double>());

            foreach (var assignment in assignmentsList)
            {
                var subjectItems = evaluationItemsByAssignment.ContainsKey(assignment.Id)
                    ? evaluationItemsByAssignment[assignment.Id]
                    : new List<EvaluationItemDto>();

                foreach (var studentId in studentIds)
                {
                    decimal studentFinalScore = 0;

                    foreach (var item in subjectItems)
                    {
                        if (item.HasCriteria)
                        {
                            var criteriaList = evaluationCriteria.ContainsKey(item.Id)
                                ? evaluationCriteria[item.Id]
                                : new List<EvaluationCriteriaModel>();

                            var criteriaScores = studentCriteriaScoresDict.ContainsKey((studentId, item.Id))
                                ? studentCriteriaScoresDict[(studentId, item.Id)]
                                : new List<StudentCriteriaScoresModel>();

                            if (criteriaScores.Any())
                            {
                                decimal criteriaScore = 0;
                                foreach (var criterio in criteriaList)
                                {
                                    var score = criteriaScores.FirstOrDefault(s => s.CriteriaId == criterio.Id)?.Score ?? 0;
                                    criteriaScore += (score / 100m) * criterio.Weight;
                                }
                                studentFinalScore += (criteriaScore / 100m) * item.Percentage;
                            }
                        }
                        else
                        {
                            var score = studentEvaluationScoresDict.ContainsKey((studentId, item.Id))
                                ? studentEvaluationScoresDict[(studentId, item.Id)].FirstOrDefault()?.Score ?? 0
                                : 0;

                            studentFinalScore += (score / 100m) * item.Percentage;
                        }
                    }

                    subjectScores[assignment.SubjectId].Add((double)studentFinalScore);
                }
            }

            var subjectAverages = subjectScores.ToDictionary(
                kv => kv.Key,
                kv => kv.Value.Any() ? Math.Round(kv.Value.Average(), 2) : 0
            );

            var result = assignmentsList
                .GroupBy(a => new { a.SubjectId, a.SubjectName })
                .Select(g => new GradeDto
                {
                    Subject = g.Key.SubjectName,
                    Average = subjectAverages[g.Key.SubjectId]
                })
                .ToList();

            return result;
        }

        public async Task<List<AttendanceDto>> GetAttendanceAsync(int userId, ReportFilterDto filter)
        {
            var staffId = await StaffHelper.GetStaffIdAsync(_context, userId);
            if (staffId == 0) return new List<AttendanceDto>();

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

            var query = _context.Attendances
                .Where(a => a.SectionId == filter.SectionId &&
                            subjectIds.Contains(a.SubjectId));

            return await query
                .GroupBy(a => a.Date.Month)
                .Select(g => new AttendanceDto
                {
                    Month = new DateTime(2025, g.Key, 1).ToString("MMM"),
                    Attendance = g.Count(x => x.StatusTypeId == 1) * 100.0 / g.Count()
                })
                .ToListAsync();
        }

        public async Task<List<PerformanceResultDto>> GetPerformanceDataAsync(int userId, ReportFilterDto filter)
        {
            var staffId = await StaffHelper.GetStaffIdAsync(_context, userId);
            if (staffId == 0) return new List<PerformanceResultDto>();
            bool isAdmin = await StaffHelper.IsAdminAsync(_context, staffId);

            var section = await _context.Sections
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == filter.SectionId);

            if (section == null)
                throw new ArgumentException("La sección especificada no existe.", nameof(filter.SectionId));

            var assignments = await _context.SectionAssignments
                .AsNoTracking()
                .Where(sa => sa.AcademicPeriodId == filter.AcademicPeriodId &&
                             sa.SectionId == filter.SectionId &&
                             (isAdmin || sa.StaffId == staffId) &&
                             (!filter.SubjectId.HasValue || sa.SubjectId == filter.SubjectId.Value))
                .ToListAsync();

            var subjectIds = assignments.Select(a => a.SubjectId).Distinct().ToList();

            var subjects = await _context.Subjects
                .AsNoTracking()
                .Where(s => subjectIds.Contains(s.Id))
                .ToDictionaryAsync(s => s.Id);

            var studentIds = await _context.SectionStudents
                .AsNoTracking()
                .Where(ss => ss.SectionId == filter.SectionId)
                .Select(ss => ss.StudentId)
                .ToListAsync();

            // --- Evaluaciones ---
            var evaluationItems = await _context.EvaluationItems
                .AsNoTracking()
                .Where(ei => assignments.Select(a => a.Id).Contains(ei.SectionAssignmentId))
                .ToListAsync();

            var evaluationItemsByAssignment = evaluationItems
                .GroupBy(ei => ei.SectionAssignmentId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var evaluationCriteria = (await _context.EvaluationCriteria
                .AsNoTracking()
                .Where(c => evaluationItems.Select(ei => ei.Id).Contains(c.EvaluationItemId))
                .ToListAsync())
                .ToLookup(c => c.EvaluationItemId);

            // --- Notas ---
            var studentEvaluationScores = (await _context.StudentEvaluationScores
                .AsNoTracking()
                .Where(s => studentIds.Contains(s.StudentId) &&
                            evaluationItems.Select(ei => ei.Id).Contains(s.EvaluationItemId))
                .ToListAsync())
                .ToLookup(s => (s.StudentId, s.EvaluationItemId));

            var studentCriteriaScores = (await _context.StudentCriteriaScores
                .AsNoTracking()
                .Where(s => studentIds.Contains(s.StudentId) &&
                            evaluationItems.Select(ei => ei.Id).Contains(s.EvaluationItemId))
                .ToListAsync())
                .ToLookup(s => (s.StudentId, s.EvaluationItemId));

            // --- Asistencias ---
            var attendances = (await _context.Attendances
                .AsNoTracking()
                .Where(a => studentIds.Contains(a.StudentId) && subjectIds.Contains(a.SubjectId))
                .ToListAsync())
                .ToLookup(a => a.SubjectId);

            // --- Calcular resultados ---
            var results = new List<PerformanceResultDto>();

            foreach (var assignment in assignments)
            {
                if (!subjects.TryGetValue(assignment.SubjectId, out var subject))
                    continue;

                var subjectItems = evaluationItemsByAssignment.ContainsKey(assignment.Id)
                    ? evaluationItemsByAssignment[assignment.Id]
                    : new List<EvaluationItemsModel>();

                var studentScores = new List<decimal>();

                foreach (var studentId in studentIds)
                {
                    decimal studentFinalScore = 0;

                    foreach (var item in subjectItems)
                    {
                        if (item.HasCriteria)
                        {
                            var criteriaList = evaluationCriteria[item.Id];
                            var criteriaScores = studentCriteriaScores[(studentId, item.Id)];

                            if (criteriaScores.Any())
                            {
                                decimal criteriaScore = 0;
                                foreach (var criterio in criteriaList)
                                {
                                    var score = criteriaScores.FirstOrDefault(s => s.CriteriaId == criterio.Id)?.Score ?? 0;
                                    criteriaScore += (score / 100m) * criterio.Weight;
                                }
                                studentFinalScore += (criteriaScore / 100m) * item.Percentage;
                            }
                        }
                        else
                        {
                            var score = studentEvaluationScores[(studentId, item.Id)].FirstOrDefault()?.Score ?? 0;
                            studentFinalScore += (score / 100m) * item.Percentage;
                        }
                    }

                    studentScores.Add(studentFinalScore);
                }

                double average = studentScores.Any()
                    ? (double)Math.Round(studentScores.Average(), 2)
                    : 0;

                var asistenciasMateria = attendances[assignment.SubjectId];
                double asistenciaPromedio = asistenciasMateria.Any()
                    ? asistenciasMateria.Count(a => a.StatusTypeId == 1) * 100.0 / asistenciasMateria.Count()
                    : 0;

                int estudiantesRiesgo = studentScores.Count(s => s < 60);

                results.Add(new PerformanceResultDto
                {
                    Section = section.Name,
                    Subject = subject.Name,
                    Average = average,
                    AttendancePercentage = asistenciaPromedio,
                    StudentsAtRisk = estudiantesRiesgo
                });
            }

            return results;
        }

        public async Task<GeneralStatsDto> GetGeneralStatsAsync(int userId, ReportFilterDto filter)
        {
            var staffId = await StaffHelper.GetStaffIdAsync(_context, userId);
            if (staffId == 0) return new GeneralStatsDto();

            bool isAdmin = await StaffHelper.IsAdminAsync(_context, staffId);

            var assignments = _context.SectionAssignments
                .Where(sa => sa.AcademicPeriodId == filter.AcademicPeriodId &&
                             sa.SectionId == filter.SectionId);

            if (!isAdmin)
            {
                assignments = assignments.Where(sa => sa.StaffId == staffId);
            }

            var assignmentsList = await assignments.ToListAsync();

            var subjectIds = assignmentsList
                .Select(sa => sa.SubjectId)
                .Distinct()
                .ToList();

            var validItems = await (
                from item in _context.EvaluationItems
                join sa in _context.SectionAssignments on item.SectionAssignmentId equals sa.Id
                where sa.SectionId == filter.SectionId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                      && subjectIds.Contains(sa.SubjectId)
                select new EvaluationItemDto
                {
                    Id = item.Id,
                    HasCriteria = item.HasCriteria,
                    Percentage = item.Percentage,
                    SubjectId = sa.SubjectId,
                    AssignmentId = sa.Id
                }
            ).ToListAsync();

            var itemIds = validItems.Select(i => i.Id).ToList();

            var criteria = await _context.EvaluationCriteria
                .Where(c => itemIds.Contains(c.EvaluationItemId))
                .ToListAsync();

            var studentCriteriaScores = await _context.StudentCriteriaScores
                .Where(s => itemIds.Contains(s.EvaluationItemId))
                .ToListAsync();

            var studentScores = await _context.StudentEvaluationScores
                .Where(s => itemIds.Contains(s.EvaluationItemId))
                .ToListAsync();

            var evaluationItemsByAssignment = validItems
                .GroupBy(i => i.AssignmentId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var evaluationCriteria = criteria
                .GroupBy(c => c.EvaluationItemId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var studentCriteriaScoresDict = studentCriteriaScores
                .GroupBy(s => (s.StudentId, s.EvaluationItemId))
                .ToDictionary(g => g.Key, g => g.ToList());

            var studentEvaluationScoresDict = studentScores
                .GroupBy(s => (s.StudentId, s.EvaluationItemId))
                .ToDictionary(g => g.Key, g => g.ToList());

            var studentIds = await _context.SectionStudents
                .Where(ss => ss.SectionId == filter.SectionId)
                .Select(ss => ss.StudentId)
                .ToListAsync();

            var subjectScores = assignmentsList.ToDictionary(a => a.SubjectId, a => new List<double>());
            var studentScoresMap = studentIds.ToDictionary(sid => sid, sid => new List<double>());

            foreach (var assignment in assignmentsList)
            {
                var subjectItems = evaluationItemsByAssignment.ContainsKey(assignment.Id)
                    ? evaluationItemsByAssignment[assignment.Id]
                    : new List<EvaluationItemDto>();

                foreach (var studentId in studentIds)
                {
                    decimal studentFinalScore = 0;

                    foreach (var item in subjectItems)
                    {
                        if (item.HasCriteria)
                        {
                            var criteriaList = evaluationCriteria.ContainsKey(item.Id)
                                ? evaluationCriteria[item.Id]
                                : new List<EvaluationCriteriaModel>();

                            var criteriaScores = studentCriteriaScoresDict.ContainsKey((studentId, item.Id))
                                ? studentCriteriaScoresDict[(studentId, item.Id)]
                                : new List<StudentCriteriaScoresModel>();

                            if (criteriaScores.Any())
                            {
                                decimal criteriaScore = 0;
                                foreach (var criterio in criteriaList)
                                {
                                    var score = criteriaScores.FirstOrDefault(s => s.CriteriaId == criterio.Id)?.Score ?? 0;
                                    criteriaScore += (score / 100m) * criterio.Weight;
                                }
                                studentFinalScore += (criteriaScore / 100m) * item.Percentage;
                            }
                        }
                        else
                        {
                            var score = studentEvaluationScoresDict.ContainsKey((studentId, item.Id))
                                ? studentEvaluationScoresDict[(studentId, item.Id)].FirstOrDefault()?.Score ?? 0
                                : 0;

                            studentFinalScore += (score / 100m) * item.Percentage;
                        }
                    }

                    subjectScores[assignment.SubjectId].Add((double)studentFinalScore);
                    studentScoresMap[studentId].Add((double)studentFinalScore);
                }
            }

            var subjectAverages = subjectScores.ToDictionary(
                kv => kv.Key,
                kv => kv.Value.Any() ? Math.Round(kv.Value.Average(), 2) : 0
            );

            double generalAverage = subjectAverages.Any()
                ? Math.Round(subjectAverages.Values.Average(), 2)
                : 0;

            var studentAverages = studentScoresMap.Values
                .Select(scores => scores.Any() ? scores.Average() : 0)
                .ToList();

            int topStudentsCount = studentAverages.Count(avg => avg >= 90);
            int atRiskStudentsCount = studentAverages.Count(avg => avg < 60);

            var attendanceQuery = _context.Attendances
                .Where(a => a.SectionId == filter.SectionId &&
                            subjectIds.Contains(a.SubjectId));

            var attendanceData = await attendanceQuery.ToListAsync();

            double averageAttendance = attendanceData.Any()
                ? attendanceData.Count(a => a.StatusTypeId == 1) * 100.0 / attendanceData.Count()
                : 0;

            return new GeneralStatsDto
            {
                GeneralAverage = generalAverage,
                AverageAttendance = averageAttendance,
                TopStudentsCount = topStudentsCount,
                AtRiskStudentsCount = atRiskStudentsCount
            };
        }

        public async Task<List<StudentPerformanceDto>> GetStudentPerformanceAsync(ReportFilterDto filter)
        {
            // 1. Traer estudiantes con su sección
            var students = await (
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
                    s.Id,
                    FullName = $"{s.Name} {s.MiddleName} {s.LastName} {s.NdLastName}".Trim(),
                    s.IdentificationNumber,
                    SectionId = sec.Id,
                    sec.Name
                }
            ).ToListAsync();

            if (!students.Any()) return new List<StudentPerformanceDto>();

            var studentIds = students.Select(e => e.Id).ToList();

            // 2. Ítems válidos según periodo, sección y materia (si aplica)
            var validItems = await (
                from item in _context.EvaluationItems
                join sa in _context.SectionAssignments on item.SectionAssignmentId equals sa.Id
                where sa.SectionId == filter.SectionId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                      && (!filter.SubjectId.HasValue || sa.SubjectId == filter.SubjectId.Value)
                select new
                {
                    item.Id,
                    item.HasCriteria,
                    item.Percentage
                }
            ).ToListAsync();

            var itemIds = validItems.Select(i => i.Id).ToList();

            // 3. Traer criterios y notas
            var criteria = await _context.EvaluationCriteria
                .Where(c => itemIds.Contains(c.EvaluationItemId))
                .ToListAsync();

            var studentCriteriaScores = await _context.StudentCriteriaScores
                .Where(s => studentIds.Contains(s.StudentId) && itemIds.Contains(s.EvaluationItemId))
                .ToListAsync();

            var studentScores = await _context.StudentEvaluationScores
                .Where(s => studentIds.Contains(s.StudentId) && itemIds.Contains(s.EvaluationItemId))
                .ToListAsync();

            // 4. Traer asistencias
            var attendance = await _context.Attendances
                .Where(a => studentIds.Contains(a.StudentId)
                            && a.SectionId == filter.SectionId
                            && (!filter.SubjectId.HasValue || a.SubjectId == filter.SubjectId.Value))
                .ToListAsync();

            // 5. Calcular promedios y asistencias
            var result = students.Select(st =>
            {
                decimal average = 0;

                foreach (var item in validItems)
                {
                    decimal itemScore = 0;

                    if (item.HasCriteria)
                    {
                        var itemCriteria = criteria.Where(c => c.EvaluationItemId == item.Id).ToList();
                        if (itemCriteria.Any())
                        {
                            decimal totalWeight = itemCriteria.Sum(c => c.Weight);
                            if (totalWeight == 0) totalWeight = 1;

                            itemScore = itemCriteria.Sum(c =>
                            {
                                var score = studentCriteriaScores
                                    .FirstOrDefault(s => s.StudentId == st.Id
                                                      && s.EvaluationItemId == item.Id
                                                      && s.CriteriaId == c.Id)?.Score ?? 0;
                                return score * (c.Weight / totalWeight);
                            });
                        }
                    }
                    else
                    {
                        itemScore = studentScores
                            .FirstOrDefault(s => s.StudentId == st.Id && s.EvaluationItemId == item.Id)?.Score ?? 0;
                    }

                    average += (itemScore * item.Percentage) / 100m;
                }

                // Asistencia
                var studentAttendance = attendance.Where(a => a.StudentId == st.Id).ToList();
                decimal attendancePercentage = 0;
                if (studentAttendance.Any())
                {
                    int total = studentAttendance.Count;
                    int presents = studentAttendance.Count(a => a.StatusTypeId == 1);
                    attendancePercentage = total == 0 ? 0 : Math.Round((decimal)presents * 100 / total, 2);
                }

                return new StudentPerformanceDto
                {
                    StudentId = st.Id,
                    Identification = st.IdentificationNumber ?? "",
                    FullName = st.FullName,
                    GroupId = st.SectionId,
                    GroupName = st.Name,
                    Average = Math.Round(average, 2),
                    AttendancePercentage = attendancePercentage
                };
            }).ToList();

            return result;
        }
    }
}
