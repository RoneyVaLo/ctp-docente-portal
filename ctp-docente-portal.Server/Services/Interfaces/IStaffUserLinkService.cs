using ctp_docente_portal.Server.DTOs.StaffUserLinks;
using ctp_docente_portal.Server.DTOs.Subjects;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IStaffUserLinkService
    {
        Task<StaffUserLinksDto> CreateAsync(StaffUserLinksCreateDto createDto, int userId);
        Task<IEnumerable<StaffUserLinksDto>> GetAllAsync();
        Task<StaffUserLinksDto> GetByIdAsync(int id);
    }
}
