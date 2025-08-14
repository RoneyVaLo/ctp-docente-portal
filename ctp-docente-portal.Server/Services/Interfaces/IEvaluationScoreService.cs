using ctp_docente_portal.Server.DTOs.StudentEvaluationScores;
using ctp_docente_portal.Server.DTOs.Students;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IEvaluationScoreService
    {
        Task<List<StudentEvaluationMatrixDto>> GetStudentScoresMatrixAsync(int subjectId, int sectionId);
        Task UpsertStudentScoresAsync(int sectionId, List<StudentEvaluationScoreDto> scores);
    }
}
