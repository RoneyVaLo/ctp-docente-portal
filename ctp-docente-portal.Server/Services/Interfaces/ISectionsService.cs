using ctp_docente_portal.Server.DTOs.Attendance;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface ISectionsService
    {
        Task<List<SectionOptionDto>> GetOptionsAsync(
            int? year = null,
            int? enrollmentId = null,
            bool? isActive = null,
            int? gradeId = null,
            CancellationToken ct = default);
    }
}
