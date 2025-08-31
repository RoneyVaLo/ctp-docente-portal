using ctp_docente_portal.Server.DTOs.EvaluationItems;

namespace ctp_docente_portal.Server.DTOs.DashboardStatistics
{
    /// <summary>
    /// Data Transfer Object representing details of a pending evaluation.
    /// </summary>
    public class EvaluationPendingDto
    {
        /// <summary>
        /// Name of the subject related to the evaluation.
        /// </summary>
        public string Subject { get; set; } = "";

        /// <summary>
        /// Name of the section related to the evaluation.
        /// </summary>
        public string Section { get; set; } = "";

        /// <summary>
        /// Evaluation item details.
        /// </summary>
        public EvaluationItemDto EvaluationItem { get; set; }
    }
}
