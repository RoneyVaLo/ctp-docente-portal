using ctp_docente_portal.Server.DTOs.StudentCriteriaScores;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IStudentCriteriaScoreService
    {
        Task UpsertStudentCriteriaScoresAsync(int sectionId, List<StudentCriteriaScoresDto> scores);
    }
}
