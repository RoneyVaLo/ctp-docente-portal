using ctp_docente_portal.Server.DTOs.Common;
using ctp_docente_portal.Server.DTOs.Sections;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IEnrollmentService
    {
        Task<List<SimpleDto>> GetAllAsync();
    }
}
