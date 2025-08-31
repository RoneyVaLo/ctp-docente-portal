namespace ctp_docente_portal.Server.DTOs.DashboardStatistics
{
    /// <summary>
    /// Data Transfer Object representing an administrative dashboard summary.
    /// </summary>
    public class AdministrativeSummaryDto
    {
        /// <summary>
        /// Total number of active students in the institution.
        /// </summary>
        public int TotalActiveStudents { get; set; }

        /// <summary>
        /// Total number of students present today.
        /// </summary>
        public int TotalPresentToday { get; set; }

        /// <summary>
        /// Total number of students expected to attend today.
        /// </summary>
        public int TotalPossibleToday { get; set; }

        /// <summary>
        /// Total number of absent students today.
        /// </summary>
        public int TotalAbsentToday { get; set; }

        /// <summary>
        /// Total number of attendance records (controls) created today.
        /// </summary>
        public int TotalControlsToday { get; set; }

        /// <summary>
        /// Total number of active teachers with assigned sections.
        /// </summary>
        public int TotalTeachersWithSections { get; set; }
    }
}
