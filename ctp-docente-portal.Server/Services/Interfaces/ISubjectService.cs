using ctp_docente_portal.Server.DTOs.Subjects;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface ISubjectService
    {
        Task<List<SubjectDto>> GetSubjectsByPeriodAsync(int academicPeriodId);
        Task<SubjectDto> GetByIdAsync(int id);
        Task<List<SubjectDto>> GetAllSubjectsAsync();

    }
}