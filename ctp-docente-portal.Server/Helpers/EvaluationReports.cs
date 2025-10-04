using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.Models;
using Microsoft.EntityFrameworkCore;
using SkiaSharp;

namespace ctp_docente_portal.Server.Helpers
{
    public static class EvaluationReports
    {
        public static async Task<(List<SectionAssignmentWithSubject> assignments,
                   Dictionary<int, List<EvaluationItemDto>> itemsByAssignment,
                   Dictionary<int, List<EvaluationCriteriaModel>> criteriaByItem,
                   Dictionary<(int studentId, int itemId), List<StudentCriteriaScoresModel>> criteriaScoresDict,
                   Dictionary<(int studentId, int itemId), List<StudentEvaluationScoresModel>> evaluationScoresDict,
                   List<int> studentIds)> PrepareEvaluationDataAsync(AppDbContext context, int userId, ReportFilterDto filter)
        {
            var staffId = await StaffHelper.GetStaffIdAsync(context, userId);
            if (staffId == 0) return (new List<SectionAssignmentWithSubject>(), new(), new(), new(), new(), new());

            bool isAdmin = await StaffHelper.IsAdminAsync(context, staffId);

            var assignments = from sa in context.SectionAssignments
                              join sub in context.Subjects on sa.SubjectId equals sub.Id
                              where sa.AcademicPeriodId == filter.AcademicPeriodId
                                    && sa.SectionId == filter.SectionId
                                    && (isAdmin || sa.StaffId == staffId)
                                    && (!filter.SubjectId.HasValue || sa.SubjectId == filter.SubjectId.Value)
                              select new SectionAssignmentWithSubject
                              {
                                  Id = sa.Id,
                                  SubjectId = sa.SubjectId,
                                  StaffId = sa.StaffId,
                                  SubjectName = sub.Name
                              };

            if (!isAdmin)
                assignments = assignments.Where(sa => sa.StaffId == staffId);

            var assignmentsList = await assignments.ToListAsync();
            if (!assignmentsList.Any())
                return (new List<SectionAssignmentWithSubject>(), new(), new(), new(), new(), new());

            var subjectIds = assignmentsList.Select(sa => sa.SubjectId).Distinct().ToList();

            // EvaluationItems
            var validItems = await (
                from item in context.EvaluationItems
                join sa in context.SectionAssignments on item.SectionAssignmentId equals sa.Id
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

            // Criteria + Scores
            var criteria = await context.EvaluationCriteria
                .Where(c => itemIds.Contains(c.EvaluationItemId))
                .ToListAsync();

            var studentCriteriaScores = await context.StudentCriteriaScores
                .Where(s => itemIds.Contains(s.EvaluationItemId))
                .ToListAsync();

            var studentScores = await context.StudentEvaluationScores
                .Where(s => itemIds.Contains(s.EvaluationItemId))
                .ToListAsync();

            // Auxiliary dictionary
            var itemsByAssignment = validItems
                .GroupBy(i => i.AssignmentId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var criteriaByItem = criteria
                .GroupBy(c => c.EvaluationItemId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var criteriaScoresDict = studentCriteriaScores
                .GroupBy(s => (s.StudentId, s.EvaluationItemId))
                .ToDictionary(g => g.Key, g => g.ToList());

            var evaluationScoresDict = studentScores
                .GroupBy(s => (s.StudentId, s.EvaluationItemId))
                .ToDictionary(g => g.Key, g => g.ToList());

            // Students in section
            var studentIds = await context.SectionStudents
                .Where(ss => ss.SectionId == filter.SectionId)
                .Select(ss => ss.StudentId)
                .ToListAsync();

            return (assignmentsList, itemsByAssignment, criteriaByItem, criteriaScoresDict, evaluationScoresDict, studentIds);
        }

        public static Dictionary<int, List<double>> CalculateStudentScores(
            List<SectionAssignmentWithSubject> assignments,
            Dictionary<int, List<EvaluationItemDto>> itemsByAssignment,
            Dictionary<int, List<EvaluationCriteriaModel>> criteriaByItem,
            Dictionary<(int studentId, int itemId), List<StudentCriteriaScoresModel>> criteriaScoresDict,
            Dictionary<(int studentId, int itemId), List<StudentEvaluationScoresModel>> evaluationScoresDict,
            List<int> studentIds)
        {
            var subjectScores = assignments.ToDictionary(a => a.SubjectId, a => new List<double>());

            foreach (var assignment in assignments)
            {
                var subjectItems = itemsByAssignment.ContainsKey(assignment.Id)
                    ? itemsByAssignment[assignment.Id]
                    : new List<EvaluationItemDto>();

                foreach (var studentId in studentIds)
                {
                    decimal studentFinalScore = 0;

                    foreach (var item in subjectItems)
                    {
                        if (item.HasCriteria)
                        {
                            var criteriaList = criteriaByItem.GetValueOrDefault(item.Id, new List<EvaluationCriteriaModel>());
                            var criteriaScores = criteriaScoresDict.GetValueOrDefault((studentId, item.Id), new List<StudentCriteriaScoresModel>());

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
                            var score = evaluationScoresDict.GetValueOrDefault((studentId, item.Id), new List<StudentEvaluationScoresModel>())
                                .FirstOrDefault()?.Score ?? 0;

                            studentFinalScore += (score / 100m) * item.Percentage;
                        }
                    }

                    subjectScores[assignment.SubjectId].Add((double)studentFinalScore);
                }
            }

            return subjectScores;
        }

    }
}
