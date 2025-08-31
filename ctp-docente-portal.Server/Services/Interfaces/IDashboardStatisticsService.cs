using ctp_docente_portal.Server.DTOs.DashboardStatistics;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    /// <summary>
    /// Interface that defines methods to retrieve dashboard statistics.
    /// </summary>
    public interface IDashboardStatisticsService
    {
        /// <summary>
        /// Retrieves a teacher summary for a given staff member and academic period.
        /// </summary>
        /// <param name="staffId">Unique identifier of the teacher.</param>
        /// <param name="periodoId">Identifier of the academic period.</param>
        /// <returns>
        /// A <see cref="TeacherSummaryDto"/> containing sections, attendance and pending evaluations information.
        /// </returns>
        Task<TeacherSummaryDto> GetTeacherSummaryAsync(int staffId, int periodoId);

        /// <summary>
        /// Retrieves an administrative summary with global institution metrics.
        /// </summary>
        /// <returns>
        /// An <see cref="AdministrativeSummaryDto"/> containing student, attendance and teacher data.
        /// </returns>
        Task<AdministrativeSummaryDto> GetAdministrativeSummaryAsync();

        /// <summary>
        /// Retrieves the sections with the highest absenteeism rates for the current date.
        /// </summary>
        /// <returns>
        /// A collection of <see cref="TopSectionAbsencesDto"/> representing the top sections with the most absences.
        /// </returns>
        Task<IEnumerable<TopSectionAbsencesDto>> GetTopAbsenteeismSectionsAsync();

        /// <summary>
        /// Retrieves the grade distribution of students grouped by performance ranges.
        /// </summary>
        /// <returns>
        /// A collection of <see cref="GradeDistributionDto"/> containing ranges, counts, and assigned colors.
        /// </returns>
        Task<IEnumerable<GradeDistributionDto>> GetGradeDistributionAsync();
    }
}
