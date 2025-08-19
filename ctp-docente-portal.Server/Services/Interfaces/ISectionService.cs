using ctp_docente_portal.Server.DTOs.Sections;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface ISectionService
    {
        Task<List<SectionDto>> GetSectionsByPeriodAndSubjectAsync(int academicPeriodId, int subjectId);
        Task<SectionDto> GetByIdAsync(int id);
    }
}
