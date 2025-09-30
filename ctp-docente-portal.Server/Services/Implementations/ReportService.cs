using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Reports;
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

        private async Task<int> GetStaffIdAsync(int userId)
        {
            return await _context.StaffUserLinks
                .Where(x => x.UserId == userId)
                .Select(x => x.StaffId)
                .FirstOrDefaultAsync();
        }

        private async Task<bool> IsAdminAsync(int staffId)
        {
            return await (
                from sr in _context.EvaluationStaffRoles
                join r in _context.EvaluationRoles on sr.RoleId equals r.Id
                where sr.StaffId == staffId
                select r.Name
            ).AnyAsync(name => name == "Administrativo");
        }

        public async Task<List<GradeDto>> GetGradesAsync(int userId, ReportFilterDto filter)
        {
            var staffId = await GetStaffIdAsync(userId);
            if (staffId == 0) return new List<GradeDto>();

            bool isAdmin = await IsAdminAsync(staffId);

            var query = from ses in _context.StudentEvaluationScores
                        join ei in _context.EvaluationItems on ses.EvaluationItemId equals ei.Id
                        join sa in _context.SectionAssignments on ei.SectionAssignmentId equals sa.Id
                        join sub in _context.Subjects on sa.SubjectId equals sub.Id
                        where sa.AcademicPeriodId == filter.AcademicPeriodId &&
                              sa.SectionId == filter.SectionId &&
                              (isAdmin || sa.StaffId == staffId) &&
                              (!filter.SubjectId.HasValue || sa.SubjectId == filter.SubjectId.Value)
                        select new { ses.Score, sub.Name };

            return await query
                .GroupBy(x => x.Name)
                .Select(g => new GradeDto
                {
                    Subject = g.Key,
                    Average = g.Average(x => (double)x.Score)
                })
                .ToListAsync();
        }

        public async Task<List<AttendanceDto>> GetAttendanceAsync(int userId, ReportFilterDto filter)
        {
            var staffId = await GetStaffIdAsync(userId);
            if (staffId == 0) return new List<AttendanceDto>();

            bool isAdmin = await IsAdminAsync(staffId);

            var query = from a in _context.Attendances
                        join sa in _context.SectionAssignments on a.SectionId equals sa.SectionId
                        where sa.AcademicPeriodId == filter.AcademicPeriodId &&
                              sa.SectionId == filter.SectionId &&
                              (isAdmin || sa.StaffId == staffId) &&
                              (!filter.SubjectId.HasValue || a.SubjectId == filter.SubjectId.Value)
                        select a;

            return await query
                .GroupBy(a => a.Date.Month)
                .Select(g => new AttendanceDto
                {
                    Month = new DateTime(2025, g.Key, 1).ToString("MMM"),
                    Attendance = g.Count(x => x.StatusTypeId == 1) * 100.0 / g.Count()
                })
                .ToListAsync();
        }


        public async Task<List<GroupReportDto>> GetGroupReportAsync(int userId, ReportFilterDto filter)
        {
            var staffId = await GetStaffIdAsync(userId);
            if (staffId == 0) return new List<GroupReportDto>();

            bool isAdmin = await IsAdminAsync(staffId);

            var query = from ses in _context.StudentEvaluationScores
                        join ei in _context.EvaluationItems on ses.EvaluationItemId equals ei.Id
                        join sa in _context.SectionAssignments on ei.SectionAssignmentId equals sa.Id
                        join s in _context.Sections on sa.SectionId equals s.Id
                        join sub in _context.Subjects on sa.SubjectId equals sub.Id
                        where sa.AcademicPeriodId == filter.AcademicPeriodId &&
                              sa.SectionId == filter.SectionId &&
                              (isAdmin || sa.StaffId == staffId) &&
                              (!filter.SubjectId.HasValue || sa.SubjectId == filter.SubjectId.Value)
                        select new { ses.StudentId, ses.Score, SectionName = s.Name, SubjectName = sub.Name, sa.SectionId, sa.SubjectId };

            var data = await query.ToListAsync();

            var report = data
                .GroupBy(x => new { x.SectionName, x.SubjectName, x.SectionId, x.SubjectId })
                .Select(g => new GroupReportDto
                {
                    Group = g.Key.SectionName,
                    Subject = g.Key.SubjectName,
                    Average = g.Average(x => (double)x.Score),
                    Attendance = (
                        from a in _context.Attendances
                        where a.SectionId == g.Key.SectionId && a.SubjectId == g.Key.SubjectId
                        select a
                    ).Count(x => x.StatusTypeId == 1) * 100.0 /
                    (
                        from a in _context.Attendances
                        where a.SectionId == g.Key.SectionId && a.SubjectId == g.Key.SubjectId
                        select a
                    ).Count(),
                    AtRisk = g.Where(x => x.Score < 60).Select(x => x.StudentId).Distinct().Count()
                })
                .ToList();

            return report;
        }


        public async Task<GeneralStatsDto> GetGeneralStatsAsync(int userId, ReportFilterDto filter)
        {
            var staffId = await GetStaffIdAsync(userId);
            if (staffId == 0) return new GeneralStatsDto();

            bool isAdmin = await IsAdminAsync(staffId);

            var scoresQuery = from ses in _context.StudentEvaluationScores
                              join ei in _context.EvaluationItems on ses.EvaluationItemId equals ei.Id
                              join sa in _context.SectionAssignments on ei.SectionAssignmentId equals sa.Id
                              where sa.AcademicPeriodId == filter.AcademicPeriodId &&
                                    sa.SectionId == filter.SectionId &&
                                    (isAdmin || sa.StaffId == staffId) &&
                                    (!filter.SubjectId.HasValue || sa.SubjectId == filter.SubjectId.Value)
                              select new { ses.StudentId, ses.Score };

            var scoresData = await scoresQuery.ToListAsync();

            double generalAverage = scoresData.Any()
                ? scoresData.Average(x => (double)x.Score)
                : 0;

            var attendanceQuery = from a in _context.Attendances
                                  join sa in _context.SectionAssignments on a.SectionId equals sa.SectionId
                                  where sa.AcademicPeriodId == filter.AcademicPeriodId &&
                                        sa.SectionId == filter.SectionId &&
                                        (isAdmin || sa.StaffId == staffId) &&
                                        (!filter.SubjectId.HasValue || a.SubjectId == filter.SubjectId.Value)
                                  select a;

            var attendanceData = await attendanceQuery.ToListAsync();

            double averageAttendance = attendanceData.Any()
                ? attendanceData.Count(a => a.StatusTypeId == 1) * 100.0 / attendanceData.Count()
                : 0;

            var studentAverages = scoresData
                .GroupBy(x => x.StudentId)
                .Select(g => g.Average(x => (double)x.Score))
                .ToList();

            int topStudentsCount = studentAverages.Count(avg => avg >= 90);
            int atRiskStudentsCount = studentAverages.Count(avg => avg < 60);

            return new GeneralStatsDto
            {
                GeneralAverage = generalAverage,
                AverageAttendance = averageAttendance,
                TopStudentsCount = topStudentsCount,
                AtRiskStudentsCount = atRiskStudentsCount
            };
        }

    }
}
