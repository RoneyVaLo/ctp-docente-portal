using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.DTOs.Sections;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface ISectionService
    {
        Task<List<SectionDto>> GetAllAsync();
        Task<List<SectionDto>> GetSectionsByPeriodAndSubjectAsync(int academicPeriodId, int subjectId, int userId);
        Task<SectionDto> GetByIdAsync(int id);

        Task<List<SectionOptionDto>> GetOptionsAsync(int? year = null, int? enrollmentId = null, bool? isActive = null, int? gradeId = null, CancellationToken ct = default);
    }
}
