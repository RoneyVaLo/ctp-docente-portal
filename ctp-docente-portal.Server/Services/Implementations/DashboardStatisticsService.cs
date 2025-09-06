using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.DashboardStatistics;
using ctp_docente_portal.Server.DTOs.EvaluationItems;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    /// <summary>
    /// Service that provides statistics and summaries for the Dashboard.
    /// Includes teacher data, administrative metrics, absenteeism and grade distribution.
    /// </summary>
    public class DashboardStatisticsService : IDashboardStatisticsService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        /// <summary>
        /// Initializes a new instance of the <see cref="DashboardStatisticsService"/> class.
        /// </summary>
        /// <param name="context">Application database context.</param>
        /// <param name="mapper">AutoMapper instance for mapping entities to DTOs.</param>
        public DashboardStatisticsService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Retrieves a teacher summary for a given staff member and academic period.
        /// </summary>
        /// <param name="staffId">Unique identifier of the teacher.</param>
        /// <param name="periodoId">Identifier of the academic period.</param>
        /// <returns>
        /// A <see cref="TeacherSummaryDto"/> containing sections, attendance and pending evaluations information.
        /// </returns>
        /// <exception cref="ArgumentException">Thrown when parameters are invalid (less than or equal to zero).</exception>
        public async Task<TeacherSummaryDto> GetTeacherSummaryAsync(int staffId, int periodoId)
        {
            if (staffId <= 0) throw new ArgumentException("El ID del profesor no es válido.");
            if (periodoId <= 0) throw new ArgumentException("El ID del período no es válido.");

            var today = DateOnly.FromDateTime(DateTime.Now);

            var quantitySections = await _context.SectionAssignments
                .Where(sa => sa.StaffId == staffId && sa.AcademicPeriodId == periodoId)
                .Select(sa => sa.SectionId)
                .Distinct()
                .CountAsync();

            var assistanceToday = await (
                from ss in _context.SectionStudent
                join sa in _context.SectionAssignments on ss.SectionId equals sa.SectionId
                join at in _context.Attendances
                    on new { ss.StudentId, ss.SectionId }
                    equals new { at.StudentId, at.SectionId }
                where sa.StaffId == staffId && sa.AcademicPeriodId == periodoId && at.Date == today
                select new { at.StatusTypeId }
            ).ToListAsync();

            var presents = assistanceToday.Count(a => a.StatusTypeId == 1); // asumimos 1 = presente
            var total = assistanceToday.Count;

            var pendingEvaluationsQuery = (
                from ei in _context.EvaluationItems
                join sa in _context.SectionAssignments on ei.SectionAssignmentId equals sa.Id
                join ss in _context.SectionStudent on sa.SectionId equals ss.SectionId
                where sa.StaffId == staffId && sa.AcademicPeriodId == periodoId
                where ei.HasCriteria == true
                where !_context.StudentEvaluationScores
                    .Where(s => s.EvaluationItemId == ei.Id)
                    .Select(s => s.StudentId)
                    .Contains(ss.StudentId)
                select ei.Id
);

            var quantityPendingEvaluations = await pendingEvaluationsQuery
                .Distinct()
                .CountAsync();

            var detailsEvaluations = await (
                from ei in _context.EvaluationItems
                join sa in _context.SectionAssignments on ei.SectionAssignmentId equals sa.Id
                join sub in _context.Subjects on sa.SubjectId equals sub.Id
                join sec in _context.Section on sa.SectionId equals sec.Id
                join ss in _context.SectionStudent on sec.Id equals ss.SectionId
                where sa.StaffId == staffId && sa.AcademicPeriodId == periodoId
                where ei.HasCriteria == true
                where !_context.StudentEvaluationScores
                    .Where(s => s.EvaluationItemId == ei.Id)
                    .Select(s => s.StudentId)
                    .Contains(ss.StudentId)
                select new EvaluationPendingDto
                {
                    Subject = sub.Name,
                    Section = sec.Name,
                    EvaluationItem = _mapper.Map<EvaluationItemDto>(ei)
                }
            ).Distinct().ToListAsync();

            return new TeacherSummaryDto
            {
                QuantitySections = quantitySections,
                PresentStudents = presents,
                TotalStudents = total,
                PendingEvaluations = quantityPendingEvaluations,
                DetailEvaluations = detailsEvaluations
            };
        }

        /// <summary>
        /// Retrieves an administrative summary with global institution metrics.
        /// </summary>
        /// <returns>
        /// An <see cref="AdministrativeSummaryDto"/> containing student, attendance and teacher data.
        /// </returns>
        public async Task<AdministrativeSummaryDto> GetAdministrativeSummaryAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);

            var totalActiveStudents = await _context.Students.CountAsync(s => s.IsActive);

            var totalPossibleToday = await _context.Attendances
                .Where(a => a.Date == today)
                .Select(a => a.StudentId)
                .Distinct()
                .CountAsync();

            var totalPresentToday = await _context.Attendances
                .Where(a => a.Date == today && a.StatusTypeId == 1)
                .Select(a => a.StudentId)
                .Distinct()
                .CountAsync();

            var totalAbsentToday = await _context.Attendances
                .Where(a => a.Date == today && a.StatusTypeId == 2)
                .CountAsync();

            var totalControlsToday = await _context.Attendances
                .Where(a => a.Date == today)
                .CountAsync();

            var totalTeachersWithSections = await _context.Staff
                .Where(st => st.isActive)
                .Where(st => _context.SectionAssignments
                    .Any(sa => sa.StaffId == st.Id))
                .CountAsync();

            return new AdministrativeSummaryDto
            {
                TotalActiveStudents = totalActiveStudents,
                TotalPresentToday = totalPresentToday,
                TotalPossibleToday = totalPossibleToday,
                TotalAbsentToday = totalAbsentToday,
                TotalControlsToday = totalControlsToday,
                TotalTeachersWithSections = totalTeachersWithSections
            };
        }

        /// <summary>
        /// Retrieves the sections with the highest absenteeism rates for the current date.
        /// </summary>
        /// <returns>
        /// A collection of <see cref="TopSectionAbsencesDto"/> representing the top 5 sections with the most absences.
        /// </returns>
        public async Task<IEnumerable<TopSectionAbsencesDto>> GetTopAbsenteeismSectionsAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);

            var query = await (
                from a in _context.Attendances
                join sec in _context.Section on a.SectionId equals sec.Id
                join sub in _context.Subjects on a.SubjectId equals sub.Id
                where a.Date == today && a.StatusTypeId == 2 // 2 = Ausente
                group new { a, sec, sub } by new
                {
                    sec.Id,
                    SectionName = sec.Name,
                    SectionSize = sec.Size,
                    SubjectName = sub.Name
                } into g
                select new
                {
                    SectionId = g.Key.Id,
                    g.Key.SectionName,
                    g.Key.SectionSize,
                    g.Key.SubjectName,
                    Absent = g.Count()
                }
            )
            .OrderByDescending(x => x.Absent)
            .Take(5)
            .ToListAsync();

            var result = query.Select(x => new TopSectionAbsencesDto
            {
                Subject = x.SubjectName,
                Section = x.SectionName,
                Absent = x.Absent,
                Total = x.SectionSize,
                Percentage = x.SectionSize > 0
                    ? Math.Round((double)x.Absent / x.SectionSize * 100, 1)
                    : 0
            });

            return result;
        }

        /// <summary>
        /// Retrieves the grade distribution of students grouped by performance ranges.
        /// </summary>
        /// <returns>
        /// A collection of <see cref="GradeDistributionDto"/> containing ranges, counts, and assigned colors.
        /// </returns>
        public async Task<IEnumerable<GradeDistributionDto>> GetGradeDistributionAsync()
        {
            var colorMap = new Dictionary<string, string>
            {
                { "Excelente (90-100)", "#4CAF50" },  // Verde
                { "Muy Bueno (80-89)", "#8BC34A" },  // Verde claro
                { "Bueno (70-79)", "#FFEB3B" },      // Amarillo
                { "Regular (60-69)", "#FF9800" },    // Naranja
                { "Necesita Mejorar (<60)", "#F44336" }  // Rojo
            };

            var rangeOrder = new Dictionary<string, int>
            {
                { "Excelente (90-100)", 1 },
                { "Muy Bueno (80-89)", 2 },
                { "Bueno (70-79)", 3 },
                { "Regular (60-69)", 4 },
                { "Necesita Mejorar (<60)", 5 }
            };

            var distribution = await _context.StudentEvaluationScores
                .GroupBy(s => s.Score >= 90 ? "Excelente (90-100)" :
                              s.Score >= 80 ? "Muy Bueno (80-89)" :
                              s.Score >= 70 ? "Bueno (70-79)" :
                              s.Score >= 60 ? "Regular (60-69)" :
                              "Necesita Mejorar (<60)")
                .Select(g => new GradeDistributionDto
                {
                    Range = g.Key,
                    Count = g.Count(),
                    Color = colorMap.ContainsKey(g.Key) ? colorMap[g.Key] : "#000000"
                })
                .ToListAsync();
            distribution = distribution
                .OrderBy(g => rangeOrder[g.Range])
                .ToList();

            return distribution;
        }
    }
}
