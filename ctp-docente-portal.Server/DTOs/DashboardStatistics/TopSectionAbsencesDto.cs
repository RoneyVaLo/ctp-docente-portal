using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.DTOs.DashboardStatistics
{
    /// <summary>
    /// Data Transfer Object representing absenteeism statistics for a specific section.
    /// </summary>
    public class TopSectionAbsencesDto
    {
        /// <summary>
        /// Name of the subject related to the section.
        /// </summary>
        public string Subject { get; set; }

        /// <summary>
        /// Name of the section.
        /// </summary>
        public string Section { get; set; }

        /// <summary>
        /// Number of absent students in the section.
        /// </summary>
        public int Absent { get; set; }

        /// <summary>
        /// Total number of students in the section.
        /// </summary>
        public int Total { get; set; }

        /// <summary>
        /// Percentage of absent students in the section.
        /// </summary>
        public double Percentage { get; set; }
    }
}
