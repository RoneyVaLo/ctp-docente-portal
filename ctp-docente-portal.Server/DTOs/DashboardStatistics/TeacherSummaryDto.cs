namespace ctp_docente_portal.Server.DTOs.DashboardStatistics
{
    /// <summary>
    /// Data Transfer Object representing a teacher's dashboard summary.
    /// </summary>
    public class TeacherSummaryDto
    {
        /// <summary>
        /// Number of sections assigned to the teacher.
        /// </summary>
        public int QuantitySections { get; set; }

        /// <summary>
        /// Number of students marked as present today.
        /// </summary>
        public int PresentStudents { get; set; }

        /// <summary>
        /// Total number of students expected today.
        /// </summary>
        public int TotalStudents { get; set; }

        /// <summary>
        /// Number of pending evaluations that require grading.
        /// </summary>
        public int PendingEvaluations { get; set; }

        /// <summary>
        /// Detailed list of pending evaluations by subject and section.
        /// </summary>
        public List<EvaluationPendingDto> DetailEvaluations { get; set; } = new();
    }
}
