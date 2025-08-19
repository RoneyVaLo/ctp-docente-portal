using ctp_docente_portal.Server.DTOs.StudentEvaluationScores;

namespace ctp_docente_portal.Server.DTOs.EvaluationItems
{
    public class EvaluationMatrixResponseDto
    {
        public List<EvaluationItemDto> Items { get; set; }
        public List<StudentEvaluationMatrixDto> Students { get; set; }
    }
}
