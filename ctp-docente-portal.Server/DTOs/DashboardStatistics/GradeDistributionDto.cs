namespace ctp_docente_portal.Server.DTOs.DashboardStatistics
{
    /// <summary>
    /// Data Transfer Object representing grade distribution statistics.
    /// </summary>
    public class GradeDistributionDto
    {
        /// <summary>
        /// Grade range (e.g., Excellent, Good, etc.).
        /// </summary>
        public string Range { get; set; } = string.Empty;

        /// <summary>
        /// Number of students that fall within this grade range.
        /// </summary>
        public int Count { get; set; }

        /// <summary>
        /// Color assigned to this grade range for visualization purposes.
        /// </summary>
        public string Color { get; set; } = string.Empty;
    }
}
